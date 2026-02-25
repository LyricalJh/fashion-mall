package com.shop.domain.cart.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class CartResponse {

    private List<CartItemResponse> items;
    private BigDecimal totalAmount;
    private int totalCount;

    public static CartResponse from(List<CartItemResponse> items) {
        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .items(items)
                .totalAmount(totalAmount)
                .totalCount(items.size())
                .build();
    }
}
