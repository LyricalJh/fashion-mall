package com.shop.domain.claim.dto;

import com.shop.domain.claim.entity.Claim;
import com.shop.domain.claim.entity.ClaimItem;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class ClaimSummaryResponse {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private String claimType;
    private String status;
    private String reason;
    private BigDecimal refundAmount;
    private LocalDateTime createdAt;
    private int itemCount;
    private String firstProductName;
    private String firstProductImageUrl;
    private int firstItemQuantity;
    private BigDecimal firstItemPrice;

    public static ClaimSummaryResponse from(Claim claim) {
        ClaimItem firstItem = claim.getItems().isEmpty() ? null : claim.getItems().get(0);

        return ClaimSummaryResponse.builder()
                .id(claim.getId())
                .orderId(claim.getOrder().getId())
                .orderNumber(claim.getOrder().getOrderNumber())
                .claimType(claim.getClaimType().name())
                .status(claim.getStatus().name())
                .reason(claim.getReason())
                .refundAmount(claim.getRefundAmount())
                .createdAt(claim.getCreatedAt())
                .itemCount(claim.getItems().size())
                .firstProductName(firstItem != null ? firstItem.getProductName() : null)
                .firstProductImageUrl(firstItem != null ? firstItem.getOrderItem().getProduct().getThumbnailUrl() : null)
                .firstItemQuantity(firstItem != null ? firstItem.getQuantity() : 0)
                .firstItemPrice(firstItem != null ? firstItem.getOrderItem().getPriceAtOrder() : null)
                .build();
    }
}
