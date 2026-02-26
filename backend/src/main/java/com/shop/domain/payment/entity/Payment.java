package com.shop.domain.payment.entity;

import com.shop.domain.common.BaseEntity;
import com.shop.domain.order.entity.Order;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "payments")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal paymentAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private LocalDateTime paymentDate;

    private String transactionId;

    private String paymentKey;

    @Column(precision = 12, scale = 2)
    private BigDecimal refundAmount;

    private LocalDateTime refundDate;

    @Builder
    public Payment(Order order, PaymentMethod paymentMethod, BigDecimal paymentAmount) {
        this.order = order;
        this.paymentMethod = paymentMethod;
        this.paymentAmount = paymentAmount;
        this.paymentStatus = PaymentStatus.PENDING;
    }

    public void complete(String transactionId) {
        this.paymentStatus = PaymentStatus.COMPLETED;
        this.transactionId = transactionId;
        this.paymentDate = LocalDateTime.now();
    }

    public void completeWithPaymentKey(String paymentKey, String transactionId) {
        this.paymentStatus = PaymentStatus.COMPLETED;
        this.paymentKey = paymentKey;
        this.transactionId = transactionId;
        this.paymentDate = LocalDateTime.now();
    }

    public void refund() {
        this.paymentStatus = PaymentStatus.REFUNDED;
        this.refundAmount = this.paymentAmount;
        this.refundDate = LocalDateTime.now();
    }
}
