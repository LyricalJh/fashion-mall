package com.shop.domain.coupon.entity;

import com.shop.domain.common.BaseEntity;
import com.shop.domain.user.entity.User;
import com.shop.global.exception.BusinessException;
import com.shop.global.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "coupons")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Coupon extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String couponName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal minOrderAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal maxDiscountAmount;

    private String description;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponStatus status = CouponStatus.AVAILABLE;

    private LocalDateTime usedAt;

    @Builder
    public Coupon(User user, String couponName, DiscountType discountType,
                  BigDecimal discountValue, BigDecimal minOrderAmount,
                  BigDecimal maxDiscountAmount, String description, LocalDateTime expiryDate) {
        this.user = user;
        this.couponName = couponName;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.minOrderAmount = minOrderAmount;
        this.maxDiscountAmount = maxDiscountAmount;
        this.description = description;
        this.expiryDate = expiryDate;
        this.status = CouponStatus.AVAILABLE;
    }

    public void use() {
        if (this.status != CouponStatus.AVAILABLE) {
            throw new BusinessException(ErrorCode.COUPON_NOT_AVAILABLE);
        }
        if (LocalDateTime.now().isAfter(this.expiryDate)) {
            this.status = CouponStatus.EXPIRED;
            throw new BusinessException(ErrorCode.COUPON_EXPIRED);
        }
        this.status = CouponStatus.USED;
        this.usedAt = LocalDateTime.now();
    }

    public void expire() {
        if (this.status == CouponStatus.AVAILABLE) {
            this.status = CouponStatus.EXPIRED;
        }
    }
}
