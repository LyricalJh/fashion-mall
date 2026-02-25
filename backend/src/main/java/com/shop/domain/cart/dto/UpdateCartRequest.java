package com.shop.domain.cart.dto;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateCartRequest {

    @Min(value = 1, message = "수량은 최소 1개 이상이어야 합니다.")
    private int quantity;
}
