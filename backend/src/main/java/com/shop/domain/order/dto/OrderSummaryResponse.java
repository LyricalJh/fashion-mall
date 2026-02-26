package com.shop.domain.order.dto;

import com.shop.domain.order.entity.Order;
import com.shop.domain.order.entity.OrderItem;
import com.shop.domain.order.entity.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderSummaryResponse {

    private Long id;
    private String orderNumber;
    private BigDecimal totalPrice;
    private OrderStatus status;
    private int itemCount;
    private LocalDateTime createdAt;
    private List<ItemSummary> items;

    @Getter
    @Builder
    public static class ItemSummary {
        private Long productId;
        private String productName;
        private String imageUrl;
        private int quantity;
        private BigDecimal price;
    }

    public static OrderSummaryResponse from(Order order) {
        List<ItemSummary> items = order.getItems().stream()
                .map(OrderSummaryResponse::toItemSummary)
                .toList();

        return OrderSummaryResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .itemCount(order.getItems().size())
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }

    private static ItemSummary toItemSummary(OrderItem item) {
        String imageUrl = item.getProduct() != null ? item.getProduct().getThumbnailUrl() : null;
        return ItemSummary.builder()
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .imageUrl(imageUrl)
                .quantity(item.getQuantity())
                .price(item.getPriceAtOrder())
                .build();
    }
}
