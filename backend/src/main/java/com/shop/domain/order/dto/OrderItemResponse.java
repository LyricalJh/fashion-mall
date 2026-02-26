package com.shop.domain.order.dto;

import com.shop.domain.order.entity.OrderItem;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class OrderItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private int quantity;
    private BigDecimal priceAtOrder;
    private BigDecimal subtotal;

    public static OrderItemResponse from(OrderItem orderItem) {
        return OrderItemResponse.builder()
                .id(orderItem.getId())
                .productId(orderItem.getProduct().getId())
                .productName(orderItem.getProductName())
                .quantity(orderItem.getQuantity())
                .priceAtOrder(orderItem.getPriceAtOrder())
                .subtotal(orderItem.getSubtotal())
                .build();
    }
}
