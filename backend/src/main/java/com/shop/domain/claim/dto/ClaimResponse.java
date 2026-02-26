package com.shop.domain.claim.dto;

import com.shop.domain.claim.entity.Claim;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ClaimResponse {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private String claimType;
    private String status;
    private String reason;
    private String note;
    private BigDecimal refundAmount;
    private String refundMethod;
    private String bankName;
    private String accountNumber;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private List<ClaimItemResponse> items;

    public static ClaimResponse from(Claim claim) {
        return ClaimResponse.builder()
                .id(claim.getId())
                .orderId(claim.getOrder().getId())
                .orderNumber(claim.getOrder().getOrderNumber())
                .claimType(claim.getClaimType().name())
                .status(claim.getStatus().name())
                .reason(claim.getReason())
                .note(claim.getNote())
                .refundAmount(claim.getRefundAmount())
                .refundMethod(claim.getRefundMethod())
                .bankName(claim.getBankName())
                .accountNumber(claim.getAccountNumber())
                .completedAt(claim.getCompletedAt())
                .createdAt(claim.getCreatedAt())
                .items(claim.getItems().stream()
                        .map(ClaimItemResponse::from)
                        .toList())
                .build();
    }
}
