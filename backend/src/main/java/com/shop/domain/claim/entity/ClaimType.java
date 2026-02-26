package com.shop.domain.claim.entity;

public enum ClaimType {
    CANCEL,  // 취소 (배송 전: CONFIRMED/PAID 상태)
    RETURN   // 반품 (배송 후: DELIVERED 상태)
}
