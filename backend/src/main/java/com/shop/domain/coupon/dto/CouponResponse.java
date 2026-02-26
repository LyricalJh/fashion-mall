package com.shop.domain.coupon.dto;

import com.shop.domain.coupon.entity.Coupon;
import com.shop.domain.coupon.entity.CouponStatus;
import com.shop.domain.coupon.entity.DiscountType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class CouponResponse {

    private Long id;
    private String couponName;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private String description;
    private LocalDateTime expiryDate;
    private CouponStatus status;
    private LocalDateTime usedAt;
    private LocalDateTime createdAt;

    public static CouponResponse from(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .couponName(coupon.getCouponName())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .description(coupon.getDescription())
                .expiryDate(coupon.getExpiryDate())
                .status(coupon.getStatus())
                .usedAt(coupon.getUsedAt())
                .createdAt(coupon.getCreatedAt())
                .build();
    }
}
