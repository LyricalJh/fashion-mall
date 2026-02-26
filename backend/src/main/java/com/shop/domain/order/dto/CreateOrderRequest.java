package com.shop.domain.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class CreateOrderRequest {

    @Valid
    @NotNull(message = "주문 상품 목록은 필수입니다.")
    private List<OrderItemRequest> items;

    @NotBlank(message = "배송 주소는 필수입니다.")
    private String shippingAddress;

    @NotBlank(message = "수령인 이름은 필수입니다.")
    private String receiverName;

    @NotBlank(message = "수령인 연락처는 필수입니다.")
    private String receiverPhone;

    private String shippingMemo;

    @Getter
    @NoArgsConstructor
    public static class OrderItemRequest {

        @NotNull(message = "상품 ID는 필수입니다.")
        private Long productId;

        @Min(value = 1, message = "수량은 1개 이상이어야 합니다.")
        private int quantity;
    }
}
