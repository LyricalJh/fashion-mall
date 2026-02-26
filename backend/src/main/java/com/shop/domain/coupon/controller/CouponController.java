package com.shop.domain.coupon.controller;

import com.shop.domain.coupon.dto.CouponResponse;
import com.shop.domain.coupon.dto.CreateCouponRequest;
import com.shop.domain.coupon.service.CouponService;
import com.shop.global.response.ApiResponse;
import com.shop.global.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupon", description = "쿠폰 API")
public class CouponController {

    private final CouponService couponService;

    @Operation(summary = "쿠폰 발급", description = "사용자에게 쿠폰을 발급합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody @Valid CreateCouponRequest request) {

        CouponResponse response = couponService.createCoupon(principal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @Operation(summary = "내 쿠폰 전체 조회", description = "현재 로그인한 사용자의 전체 쿠폰 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getCoupons(
            @AuthenticationPrincipal UserPrincipal principal) {

        List<CouponResponse> response = couponService.getCoupons(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "사용 가능한 쿠폰 조회", description = "현재 사용 가능한 쿠폰 목록을 조회합니다.")
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAvailableCoupons(
            @AuthenticationPrincipal UserPrincipal principal) {

        List<CouponResponse> response = couponService.getAvailableCoupons(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "쿠폰 사용", description = "쿠폰을 사용 처리합니다.")
    @PostMapping("/{couponId}/use")
    public ResponseEntity<ApiResponse<CouponResponse>> useCoupon(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long couponId) {

        CouponResponse response = couponService.useCoupon(principal.getUserId(), couponId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
