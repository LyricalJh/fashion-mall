package com.shop.domain.order.entity;

public enum OrderStatus {
    PENDING,    // 결제 대기
    CONFIRMED,  // 주문 확인
    PAID,       // 결제 완료
    SHIPPING,   // 배송 중
    DELIVERED,  // 배송 완료
    CANCELLED   // 취소됨
}
