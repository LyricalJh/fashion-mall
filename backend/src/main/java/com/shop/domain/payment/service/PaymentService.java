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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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

    private static final ObjectMapper objectMapper = new ObjectMapper();

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

        // #5: 결제 완료 전 주문이 취소된 경우 거부
        if (payment.getOrder().getStatus() == com.shop.domain.order.entity.OrderStatus.CANCELLED) {
            log.info("Payment failed (order cancelled): paymentId={}, orderId={}", payment.getId(), request.getOrderId());
            payment.fail();
            throw new BusinessException(ErrorCode.ORDER_ALREADY_CANCELLED);
        }

        // #3: BigDecimal 정밀 비교 (intValue() 대신 compareTo 사용)
        if (payment.getPaymentAmount().compareTo(BigDecimal.valueOf(request.getAmount())) != 0) {
            throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }

        // H3: 주문 총액 vs 결제 금액 교차 검증 (금액 변조 방지)
        BigDecimal orderTotal = payment.getOrder().getTotalPrice();
        if (orderTotal != null && orderTotal.compareTo(BigDecimal.valueOf(request.getAmount())) != 0) {
            log.error("Order total mismatch: orderTotal={}, requestAmount={}, orderId={}",
                      orderTotal, request.getAmount(), request.getOrderId());
            throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH, "주문 금액과 결제 금액이 일치하지 않습니다.");
        }

        try {
            String encodedKey = Base64.getEncoder()
                    .encodeToString((tossProperties.getSecretKey() + ":").getBytes(StandardCharsets.UTF_8));

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + encodedKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            // #1: 멱등키 추가 - 네트워크 재시도 시 중복 결제 방지
            headers.set("Idempotency-Key", request.getOrderId());

            Map<String, Object> body = Map.of(
                    "paymentKey", request.getPaymentKey(),
                    "orderId", request.getOrderId(),
                    "amount", request.getAmount()
            );

            HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(TOSS_CONFIRM_URL, httpEntity, String.class);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            String responseBody = e.getResponseBodyAsString();
            Map<String, String> tossError = parseTossError(responseBody);
            String tossCode = tossError.get("code");
            String tossMessage = tossError.get("message");

            // 이미 처리 중이거나 이미 승인된 결제는 성공으로 처리 (멱등성)
            if ("ALREADY_PROCESSING_PAYMENT".equals(tossCode) || "ALREADY_APPROVED".equals(tossCode)) {
                log.warn("Toss payment already processing/approved: code={}, orderId={}", tossCode, request.getOrderId());
            } else {
                log.error("Toss payment confirm failed: code={}, message={}, orderId={}", tossCode, tossMessage, request.getOrderId());
                log.info("Payment failed: paymentId={}, orderId={}", payment.getId(), request.getOrderId());
                payment.fail();
                String userMessage = toUserMessage(tossCode);
                throw new BusinessException(ErrorCode.TOSS_PAYMENT_CONFIRM_FAILED, userMessage);
            }
        } catch (Exception e) {
            log.error("Toss payment confirm failed (unexpected): orderId={}, error={}", request.getOrderId(), e.getMessage(), e);
            log.info("Payment failed: paymentId={}, orderId={}", payment.getId(), request.getOrderId());
            payment.fail();
            throw new BusinessException(ErrorCode.TOSS_PAYMENT_CONFIRM_FAILED);
        }

        log.info("Payment completing: paymentId={}, orderId={}, amount={}", payment.getId(), request.getOrderId(), request.getAmount());
        payment.completeWithPaymentKey(request.getPaymentKey(), request.getPaymentKey());
        payment.getOrder().markPaid();

        return PaymentResponse.from(payment);
    }

    private Map<String, String> parseTossError(String responseBody) {
        try {
            JsonNode node = objectMapper.readTree(responseBody);
            String code = node.has("code") ? node.get("code").asText() : "UNKNOWN";
            String message = node.has("message") ? node.get("message").asText() : responseBody;
            return Map.of("code", code, "message", message);
        } catch (Exception e) {
            return Map.of("code", "UNKNOWN", "message", responseBody);
        }
    }

    private String toUserMessage(String tossCode) {
        return switch (tossCode) {
            case "NOT_FOUND_PAYMENT_SESSION" -> "결제 시간이 만료되었습니다. 다시 시도해 주세요.";
            case "REJECT_CARD_COMPANY" -> "카드사에서 결제를 거절했습니다. 다른 카드로 시도해 주세요.";
            case "FORBIDDEN_REQUEST" -> "결제 요청 정보가 올바르지 않습니다.";
            case "UNAUTHORIZED_KEY" -> "결제 처리 중 오류가 발생했습니다.";
            default -> "결제 승인에 실패했습니다.";
        };
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
            // #1: 멱등키 추가 - 취소 재시도 시 중복 취소 방지
            headers.set("Idempotency-Key", "cancel_" + payment.getOrder().getOrderNumber());

            Map<String, String> body = Map.of("cancelReason", cancelReason);

            HttpEntity<Map<String, String>> httpEntity = new HttpEntity<>(body, headers);
            String cancelUrl = TOSS_CANCEL_URL.replace("{paymentKey}", payment.getPaymentKey());
            restTemplate.postForEntity(cancelUrl, httpEntity, String.class);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            Map<String, String> tossError = parseTossError(e.getResponseBodyAsString());
            log.error("Toss payment cancel failed: code={}, message={}, paymentKey={}",
                      tossError.get("code"), tossError.get("message"), payment.getPaymentKey());
            throw new BusinessException(ErrorCode.TOSS_PAYMENT_CANCEL_FAILED,
                      "결제 취소에 실패했습니다: " + tossError.get("message"));
        } catch (Exception e) {
            log.error("Toss payment cancel failed (unexpected): paymentKey={}, error={}",
                      payment.getPaymentKey(), e.getMessage(), e);
            throw new BusinessException(ErrorCode.TOSS_PAYMENT_CANCEL_FAILED);
        }

        log.info("Payment refunding: paymentId={}, paymentKey={}", payment.getId(), payment.getPaymentKey());
        payment.refund();
        return PaymentResponse.from(payment);
    }
}
