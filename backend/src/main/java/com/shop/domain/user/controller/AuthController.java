package com.shop.domain.user.controller;

import com.shop.domain.user.dto.AuthResponse;
import com.shop.domain.user.dto.LoginRequest;
import com.shop.domain.user.dto.SignupRequest;
import com.shop.domain.user.service.AuthService;
import com.shop.domain.user.service.KakaoAuthService;
import com.shop.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@Tag(name = "Auth", description = "인증 관련 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final AuthService authService;
    private final KakaoAuthService kakaoAuthService;

    @Operation(summary = "회원가입", description = "이메일, 비밀번호, 이름으로 신규 회원을 등록합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "회원가입 성공",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "입력값 오류"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "409",
                    description = "이미 존재하는 이메일"
            )
    })
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse authResponse = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(authResponse));
    }

    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인하여 JWT 토큰을 발급합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "로그인 성공",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "이메일 또는 비밀번호 불일치"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "사용자를 찾을 수 없음"
            )
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(authResponse));
    }

    @Operation(summary = "카카오 로그인 URL", description = "카카오 로그인 인가 코드 요청 URL을 반환합니다.")
    @GetMapping("/kakao")
    public ResponseEntity<Void> kakaoLogin() {
        String kakaoLoginUrl = kakaoAuthService.getKakaoLoginUrl();
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(kakaoLoginUrl))
                .build();
    }

    @Operation(summary = "카카오 로그인 콜백", description = "카카오 인가 코드로 로그인을 처리하고 JWT 토큰을 반환합니다.")
    @GetMapping("/kakao/callback")
    public ResponseEntity<ApiResponse<AuthResponse>> kakaoCallback(@RequestParam String code) {
        AuthResponse authResponse = kakaoAuthService.kakaoLogin(code);
        return ResponseEntity.ok(ApiResponse.ok(authResponse));
    }
}
