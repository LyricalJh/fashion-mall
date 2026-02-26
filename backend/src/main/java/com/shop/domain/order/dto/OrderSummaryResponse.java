package com.shop.domain.order.dto;

import com.shop.domain.order.entity.Order;
import com.shop.domain.order.entity.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class OrderSummaryResponse {

    private Long id;
    private String orderNumber;
    private BigDecimal totalPrice;
    private OrderStatus status;
    private int itemCount;
    private LocalDateTime createdAt;

    public static OrderSummaryResponse from(Order order) {
        return OrderSummaryResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .itemCount(order.getItems().size())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
