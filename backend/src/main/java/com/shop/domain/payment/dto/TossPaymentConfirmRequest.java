package com.shop.domain.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TossPaymentConfirmRequest {
    @NotBlank
    private String paymentKey;
    @NotBlank
    private String orderId;
    @NotNull
    private Integer amount;
}
