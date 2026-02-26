package com.shop.domain.user.service;

import com.shop.domain.user.dto.AuthResponse;
import com.shop.domain.user.dto.KakaoShippingAddressResponse;
import com.shop.domain.user.dto.KakaoTokenResponse;
import com.shop.domain.user.dto.KakaoUserResponse;
import com.shop.domain.user.entity.LoginType;
import com.shop.domain.user.entity.User;
import com.shop.domain.user.repository.UserRepository;
import com.shop.global.config.KakaoProperties;
import com.shop.global.exception.BusinessException;
import com.shop.global.exception.ErrorCode;
import com.shop.global.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoAuthService {

    private static final String KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
    private static final String KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";
    private static final String KAKAO_SHIPPING_URL = "https://kapi.kakao.com/v1/user/shipping_address";

    private final KakaoProperties kakaoProperties;
    private final RestTemplate restTemplate;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public KakaoTokenResponse getKakaoToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", kakaoProperties.getRestApiKey());
        params.add("redirect_uri", kakaoProperties.getRedirectUri());
        params.add("code", code);
        params.add("client_secret", kakaoProperties.getClientSecret());

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<KakaoTokenResponse> response = restTemplate.postForEntity(
                    KAKAO_TOKEN_URL, request, KakaoTokenResponse.class
            );
            if (response.getBody() == null) {
                throw new BusinessException(ErrorCode.KAKAO_TOKEN_REQUEST_FAILED);
            }
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Failed to get Kakao token: {}", e.getMessage());
            throw new BusinessException(ErrorCode.KAKAO_TOKEN_REQUEST_FAILED);
        }
    }

    public KakaoUserResponse getKakaoUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<KakaoUserResponse> response = restTemplate.exchange(
                    KAKAO_USER_INFO_URL, HttpMethod.GET, request, KakaoUserResponse.class
            );
            if (response.getBody() == null) {
                throw new BusinessException(ErrorCode.KAKAO_USER_INFO_REQUEST_FAILED);
            }
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Failed to get Kakao user info: {}", e.getMessage());
            throw new BusinessException(ErrorCode.KAKAO_USER_INFO_REQUEST_FAILED);
        }
    }

    public KakaoShippingAddressResponse getShippingAddresses(String kakaoAccessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(kakaoAccessToken);
        HttpEntity<Void> request = new HttpEntity<>(headers);
        try {
            ResponseEntity<KakaoShippingAddressResponse> response = restTemplate.exchange(
                    KAKAO_SHIPPING_URL, HttpMethod.GET, request, KakaoShippingAddressResponse.class
            );
            return response.getBody();
        } catch (RestClientException e) {
            log.warn("Failed to get Kakao shipping addresses: {}", e.getMessage());
            return null; // non-fatal, just skip
        }
    }

    @Transactional
    public AuthResponse kakaoLogin(String code) {
        KakaoTokenResponse tokenResponse = getKakaoToken(code);
        KakaoUserResponse userInfo = getKakaoUserInfo(tokenResponse.getAccessToken());

        User user = userRepository.findByKakaoId(userInfo.getId())
                .orElseGet(() -> createKakaoUser(userInfo));

        // Save kakao tokens
        user.updateKakaoTokens(tokenResponse.getAccessToken(), tokenResponse.getRefreshToken());

        // Fetch shipping address if user has no address yet
        if (user.getAddress() == null || user.getAddress().isBlank()) {
            try {
                KakaoShippingAddressResponse shippingResponse = getShippingAddresses(tokenResponse.getAccessToken());
                if (shippingResponse != null && shippingResponse.getShippingAddresses() != null) {
                    shippingResponse.getShippingAddresses().stream()
                            .filter(addr -> Boolean.TRUE.equals(addr.getIsDefault()))
                            .findFirst()
                            .ifPresent(addr -> user.updateAddress(
                                    addr.getReceiverPhoneNumber1(),
                                    addr.getZoneNumber(),
                                    addr.getBaseAddress(),
                                    addr.getDetailAddress()
                            ));
                }
            } catch (Exception e) {
                log.warn("Failed to fetch shipping address from Kakao: {}", e.getMessage());
            }
        }

        userRepository.save(user);
        return buildAuthResponse(user);
    }

    private User createKakaoUser(KakaoUserResponse userInfo) {
        String nickname = "kakao_user";
        String profileImageUrl = null;
        String email = null;
        String phoneNumber = null;

        if (userInfo.getKakaoAccount() != null) {
            email = userInfo.getKakaoAccount().getEmail();
            phoneNumber = userInfo.getKakaoAccount().getPhoneNumber();
            if (userInfo.getKakaoAccount().getProfile() != null) {
                nickname = userInfo.getKakaoAccount().getProfile().getNickname();
                profileImageUrl = userInfo.getKakaoAccount().getProfile().getProfileImageUrl();
            }
        }

        if (email == null || email.isBlank()) {
            email = "kakao_" + userInfo.getId() + "@kakao.local";
        }

        // If the email already exists (local user), generate a unique email
        if (userRepository.existsByEmail(email)) {
            email = "kakao_" + userInfo.getId() + "@kakao.local";
            if (userRepository.existsByEmail(email)) {
                email = "kakao_" + userInfo.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + "@kakao.local";
            }
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .name(nickname != null ? nickname : "kakao_user")
                .role(User.Role.USER)
                .kakaoId(userInfo.getId())
                .profileImageUrl(profileImageUrl)
                .loginType(LoginType.KAKAO)
                .phone(phoneNumber)
                .build();

        return userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .phone(user.getPhone())
                .postcode(user.getPostcode())
                .address(user.getAddress())
                .addressDetail(user.getAddressDetail())
                .build();
    }

    public String getKakaoLoginUrl() {
        return "https://kauth.kakao.com/oauth/authorize"
                + "?client_id=" + kakaoProperties.getRestApiKey()
                + "&redirect_uri=" + kakaoProperties.getRedirectUri()
                + "&response_type=code"
                + "&scope=shipping_address";
    }
}
