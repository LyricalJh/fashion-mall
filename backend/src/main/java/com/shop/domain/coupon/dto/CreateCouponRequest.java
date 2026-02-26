package com.shop.domain.coupon.dto;

import com.shop.domain.coupon.entity.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class CreateCouponRequest {

    @NotBlank(message = "쿠폰명은 필수입니다.")
    private String couponName;

    @NotNull(message = "할인 타입은 필수입니다.")
    private DiscountType discountType;

    @NotNull(message = "할인 값은 필수입니다.")
    @Positive(message = "할인 값은 양수여야 합니다.")
    private BigDecimal discountValue;

    @NotNull(message = "최소 주문 금액은 필수입니다.")
    private BigDecimal minOrderAmount;

    private BigDecimal maxDiscountAmount;

    private String description;

    @NotNull(message = "만료일은 필수입니다.")
    private LocalDateTime expiryDate;
}
