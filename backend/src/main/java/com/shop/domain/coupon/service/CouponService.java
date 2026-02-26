package com.shop.domain.coupon.service;

import com.shop.domain.coupon.dto.CouponResponse;
import com.shop.domain.coupon.dto.CreateCouponRequest;
import com.shop.domain.coupon.entity.Coupon;
import com.shop.domain.coupon.entity.CouponStatus;
import com.shop.domain.coupon.repository.CouponRepository;
import com.shop.domain.user.entity.User;
import com.shop.domain.user.repository.UserRepository;
import com.shop.global.exception.BusinessException;
import com.shop.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponService {

    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    public CouponResponse createCoupon(Long userId, CreateCouponRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Coupon coupon = Coupon.builder()
                .user(user)
                .couponName(request.getCouponName())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .description(request.getDescription())
                .expiryDate(request.getExpiryDate())
                .build();

        couponRepository.save(coupon);
        return CouponResponse.from(coupon);
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> getCoupons(Long userId) {
        return couponRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(CouponResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> getAvailableCoupons(Long userId) {
        return couponRepository.findByUserIdAndStatusOrderByExpiryDateAsc(userId, CouponStatus.AVAILABLE).stream()
                .map(CouponResponse::from)
                .collect(Collectors.toList());
    }

    public CouponResponse useCoupon(Long userId, Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COUPON_NOT_FOUND));

        if (!coupon.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.COUPON_NOT_FOUND);
        }

        coupon.use();
        return CouponResponse.from(coupon);
    }
}
