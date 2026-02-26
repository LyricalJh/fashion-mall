package com.shop.domain.order.dto;

import com.shop.domain.order.entity.Order;
import com.shop.domain.order.entity.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponse {

    private Long id;
    private Long userId;
    private String orderNumber;
    private List<OrderItemResponse> items;
    private BigDecimal totalPrice;
    private OrderStatus status;
    private String shippingAddress;
    private String receiverName;
    private String receiverPhone;
    private String shippingMemo;
    private LocalDateTime createdAt;

    public static OrderResponse from(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(OrderItemResponse::from)
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .orderNumber(order.getOrderNumber())
                .items(itemResponses)
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .shippingMemo(order.getShippingMemo())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
