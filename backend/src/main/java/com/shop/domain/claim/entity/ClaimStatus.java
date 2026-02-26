package com.shop.domain.claim.entity;

public enum ClaimStatus {
    RECEIVED,    // 접수
    PROCESSING,  // 처리중
    PICKUP,      // 회수중 (반품만 해당)
    PICKED_UP,   // 회수완료 (반품만 해당)
    COMPLETED,   // 완료 (환불 처리됨)
    REJECTED     // 불가
}
