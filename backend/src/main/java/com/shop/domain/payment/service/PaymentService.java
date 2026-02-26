package com.shop.domain.payment.service;

import com.shop.domain.order.entity.Order;
import com.shop.domain.order.repository.OrderRepository;
import com.shop.domain.payment.dto.PaymentResponse;
import com.shop.domain.payment.dto.TossPaymentConfirmRequest;
import com.shop.domain.payment.entity.Payment;
import com.shop.domain.payment.entity.PaymentMethod;
import com.shop.domain.payment.entity.PaymentStatus;
import com.shop.domain.payment.repository.PaymentRepository;
import com.shop.global.config.TossPaymentsProperties;
import com.shop.global.exception.BusinessException;
import com.shop.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private static final String TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";
    private static final String TOSS_CANCEL_URL = "https://api.tosspayments.com/v1/payments/{paymentKey}/cancel";

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final TossPaymentsProperties tossProperties;
    private final RestTemplate restTemplate;

    public PaymentResponse createPayment(Long orderId, PaymentMethod method, BigDecimal amount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(method)
                .paymentAmount(amount)
                .build();

        paymentRepository.save(payment);
        return PaymentResponse.from(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));
        return PaymentResponse.from(payment);
    }

    public PaymentResponse completePayment(Long paymentId, String transactionId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.PAYMENT_ALREADY_COMPLETED);
        }

        payment.complete(transactionId);
        return PaymentResponse.from(payment);
    }

    public PaymentResponse refundPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getPaymentStatus() == PaymentStatus.REFUNDED) {
            throw new BusinessException(ErrorCode.PAYMENT_ALREADY_REFUNDED);
        }

        payment.refund();
        return PaymentResponse.from(payment);
    }

    public PaymentResponse confirmTossPayment(TossPaymentConfirmRequest request) {
        Payment payment = paymentRepository.findByOrderOrderNumber(request.getOrderId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        // 이미 완료된 결제면 바로 성공 반환 (멱등성)
        if (payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
            return PaymentResponse.from(payment);
        }

        // Compare integer values to avoid BigDecimal scale mismatch (e.g., 50000.00 vs 50000)
        if (payment.getPaymentAmount().intValue() != request.getAmount()) {
            throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }

        try {
            String encodedKey = Base64.getEncoder()
                    .encodeToString((tossProperties.getSecretKey() + ":").getBytes(StandardCharsets.UTF_8));

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + encodedKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                    "paymentKey", request.getPaymentKey(),
                    "orderId", request.getOrderId(),
                    "amount", request.getAmount()
            );

            HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(TOSS_CONFIRM_URL, httpEntity, String.class);
        } catch (Exception e) {
            log.error("Toss payment confirm failed: {}", e.getMessage(), e);
            throw new BusinessException(ErrorCode.TOSS_PAYMENT_CONFIRM_FAILED);
        }

        payment.completeWithPaymentKey(request.getPaymentKey(), request.getPaymentKey());
        payment.getOrder().markPaid();

        return PaymentResponse.from(payment);
    }

    public PaymentResponse cancelTossPayment(Long paymentId, String cancelReason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        try {
            String encodedKey = Base64.getEncoder()
                    .encodeToString((tossProperties.getSecretKey() + ":").getBytes(StandardCharsets.UTF_8));

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + encodedKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = Map.of("cancelReason", cancelReason);

            HttpEntity<Map<String, String>> httpEntity = new HttpEntity<>(body, headers);
            String cancelUrl = TOSS_CANCEL_URL.replace("{paymentKey}", payment.getPaymentKey());
            restTemplate.postForEntity(cancelUrl, httpEntity, String.class);
        } catch (Exception e) {
            log.error("Toss payment cancel failed: {}", e.getMessage(), e);
            throw new BusinessException(ErrorCode.TOSS_PAYMENT_CANCEL_FAILED);
        }

        payment.refund();
        return PaymentResponse.from(payment);
    }
}
