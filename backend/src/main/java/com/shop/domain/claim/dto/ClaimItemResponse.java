package com.shop.domain.claim.dto;

import com.shop.domain.claim.entity.ClaimItem;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class ClaimItemResponse {
    private Long id;
    private Long orderItemId;
    private Long productId;
    private String productName;
    private int quantity;
    private BigDecimal priceAtOrder;
    private BigDecimal subtotal;
    private String imageUrl;

    public static ClaimItemResponse from(ClaimItem claimItem) {
        BigDecimal price = claimItem.getOrderItem().getPriceAtOrder();
        return ClaimItemResponse.builder()
                .id(claimItem.getId())
                .orderItemId(claimItem.getOrderItem().getId())
                .productId(claimItem.getOrderItem().getProduct().getId())
                .productName(claimItem.getProductName())
                .quantity(claimItem.getQuantity())
                .priceAtOrder(price)
                .subtotal(price.multiply(BigDecimal.valueOf(claimItem.getQuantity())))
                .imageUrl(claimItem.getOrderItem().getProduct().getThumbnailUrl())
                .build();
    }
}
