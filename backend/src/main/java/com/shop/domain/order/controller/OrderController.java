package com.shop.domain.order.controller;

import com.shop.domain.order.dto.CreateOrderRequest;
import com.shop.domain.order.dto.OrderResponse;
import com.shop.domain.order.dto.OrderSummaryResponse;
import com.shop.domain.order.service.OrderService;
import com.shop.global.response.ApiResponse;
import com.shop.global.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order", description = "주문 API")
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "주문 생성", description = "장바구니 또는 직접 입력한 상품 목록으로 주문을 생성합니다. 재고 감소 및 장바구니 초기화가 원자적으로 처리됩니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody @Valid CreateOrderRequest request) {

        OrderResponse response = orderService.createOrder(principal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @Operation(summary = "주문 목록 조회", description = "현재 로그인한 사용자의 주문 목록을 최신순으로 페이징 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderSummaryResponse>>> getOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<OrderSummaryResponse> response = orderService.getOrders(principal.getUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "주문 상세 조회", description = "특정 주문의 상세 정보를 조회합니다. 본인의 주문만 조회 가능합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        OrderResponse response = orderService.getOrder(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "주문 취소", description = "주문을 취소합니다. PENDING, PAID 상태만 취소 가능하며, 재고가 자동으로 복구됩니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        OrderResponse response = orderService.cancelOrder(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
