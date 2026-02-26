package com.shop.domain.coupon.repository;

import com.shop.domain.coupon.entity.Coupon;
import com.shop.domain.coupon.entity.CouponStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

    List<Coupon> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Coupon> findByUserIdAndStatusOrderByExpiryDateAsc(Long userId, CouponStatus status);
}
