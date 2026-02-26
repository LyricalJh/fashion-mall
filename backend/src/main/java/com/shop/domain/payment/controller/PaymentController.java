package com.shop.domain.payment.controller;

import com.shop.domain.payment.dto.PaymentResponse;
import com.shop.domain.payment.dto.TossPaymentConfirmRequest;
import com.shop.domain.payment.service.PaymentService;
import com.shop.global.config.TossPaymentsProperties;
import com.shop.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Payment", description = "결제 API")
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final TossPaymentsProperties tossPaymentsProperties;

    @Operation(summary = "주문별 결제 조회", description = "주문 ID로 결제 정보를 조회합니다.")
    @GetMapping("/orders/{orderId}")
    public ApiResponse<PaymentResponse> getPaymentByOrder(@PathVariable Long orderId) {
        return ApiResponse.ok(paymentService.getPaymentByOrderId(orderId));
    }

    @Operation(summary = "결제 완료 처리", description = "결제를 완료 상태로 변경합니다.")
    @PostMapping("/{paymentId}/complete")
    public ApiResponse<PaymentResponse> completePayment(
            @PathVariable Long paymentId,
            @RequestParam String transactionId) {
        return ApiResponse.ok(paymentService.completePayment(paymentId, transactionId));
    }

    @Operation(summary = "결제 환불", description = "결제를 환불 처리합니다.")
    @PostMapping("/{paymentId}/refund")
    public ApiResponse<PaymentResponse> refundPayment(@PathVariable Long paymentId) {
        return ApiResponse.ok(paymentService.refundPayment(paymentId));
    }

    @Operation(summary = "토스페이먼츠 결제 승인", description = "토스페이먼츠 결제를 승인합니다.")
    @PostMapping("/confirm")
    public ApiResponse<PaymentResponse> confirmPayment(@RequestBody @Valid TossPaymentConfirmRequest request) {
        return ApiResponse.ok(paymentService.confirmTossPayment(request));
    }

    @Operation(summary = "토스페이먼츠 결제 취소", description = "토스페이먼츠 결제를 취소합니다.")
    @PostMapping("/{paymentId}/cancel")
    public ApiResponse<PaymentResponse> cancelPayment(@PathVariable Long paymentId, @RequestBody Map<String, String> body) {
        return ApiResponse.ok(paymentService.cancelTossPayment(paymentId, body.get("cancelReason")));
    }

    @Operation(summary = "토스페이먼츠 클라이언트 키 조회", description = "프론트엔드에서 사용할 클라이언트 키를 반환합니다.")
    @GetMapping("/client-key")
    public ApiResponse<Map<String, String>> getClientKey() {
        return ApiResponse.ok(Map.of("clientKey", tossPaymentsProperties.getClientKey()));
    }
}
