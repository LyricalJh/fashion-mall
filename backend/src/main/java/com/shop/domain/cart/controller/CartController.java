package com.shop.domain.cart.controller;

import com.shop.domain.cart.dto.AddCartRequest;
import com.shop.domain.cart.dto.CartItemResponse;
import com.shop.domain.cart.dto.CartResponse;
import com.shop.domain.cart.dto.UpdateCartRequest;
import com.shop.domain.cart.service.CartService;
import com.shop.global.response.ApiResponse;
import com.shop.global.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "장바구니 API")
public class CartController {

    private final CartService cartService;

    @Operation(summary = "장바구니 조회", description = "현재 로그인한 사용자의 장바구니를 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal UserPrincipal principal) {

        CartResponse response = cartService.getCart(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "장바구니 담기", description = "상품을 장바구니에 추가합니다. 이미 담겨 있는 상품은 수량이 추가됩니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<CartItemResponse>> addToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody @Valid AddCartRequest request) {

        CartItemResponse response = cartService.addToCart(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "장바구니 수량 변경", description = "장바구니 아이템의 수량을 변경합니다.")
    @PutMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse<CartItemResponse>> updateCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long cartItemId,
            @RequestBody @Valid UpdateCartRequest request) {

        CartItemResponse response = cartService.updateCartItem(principal.getUserId(), cartItemId, request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "장바구니 아이템 삭제", description = "장바구니에서 특정 아이템을 삭제합니다.")
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse<Void>> removeCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long cartItemId) {

        cartService.removeCartItem(principal.getUserId(), cartItemId);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @Operation(summary = "장바구니 전체 비우기", description = "장바구니의 모든 아이템을 삭제합니다.")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal UserPrincipal principal) {

        cartService.clearCart(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
