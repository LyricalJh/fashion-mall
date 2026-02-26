package com.shop.domain.payment.dto;

import com.shop.domain.payment.entity.Payment;
import com.shop.domain.payment.entity.PaymentMethod;
import com.shop.domain.payment.entity.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentResponse {

    private Long id;
    private Long orderId;
    private PaymentMethod paymentMethod;
    private BigDecimal paymentAmount;
    private PaymentStatus paymentStatus;
    private LocalDateTime paymentDate;
    private String transactionId;
    private String paymentKey;
    private BigDecimal refundAmount;
    private LocalDateTime refundDate;
    private LocalDateTime createdAt;

    public static PaymentResponse from(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .paymentMethod(payment.getPaymentMethod())
                .paymentAmount(payment.getPaymentAmount())
                .paymentStatus(payment.getPaymentStatus())
                .paymentDate(payment.getPaymentDate())
                .transactionId(payment.getTransactionId())
                .paymentKey(payment.getPaymentKey())
                .refundAmount(payment.getRefundAmount())
                .refundDate(payment.getRefundDate())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
