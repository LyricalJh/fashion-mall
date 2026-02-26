package com.shop.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Product
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "상품을 찾을 수 없습니다."),
    OUT_OF_STOCK(HttpStatus.BAD_REQUEST, "OUT_OF_STOCK", "재고가 부족합니다."),

    // Category
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "카테고리를 찾을 수 없습니다."),

    // Cart
    CART_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "CART_ITEM_NOT_FOUND", "장바구니 아이템을 찾을 수 없습니다."),

    // Order
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "ORDER_NOT_FOUND", "주문을 찾을 수 없습니다."),

    // Payment
    PAYMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUND", "결제 정보를 찾을 수 없습니다."),
    PAYMENT_ALREADY_COMPLETED(HttpStatus.BAD_REQUEST, "PAYMENT_ALREADY_COMPLETED", "이미 완료된 결제입니다."),
    PAYMENT_ALREADY_REFUNDED(HttpStatus.BAD_REQUEST, "PAYMENT_ALREADY_REFUNDED", "이미 환불된 결제입니다."),
    TOSS_PAYMENT_CONFIRM_FAILED(HttpStatus.BAD_REQUEST, "TOSS_PAYMENT_CONFIRM_FAILED", "결제 승인에 실패했습니다."),
    TOSS_PAYMENT_CANCEL_FAILED(HttpStatus.BAD_REQUEST, "TOSS_PAYMENT_CANCEL_FAILED", "결제 취소에 실패했습니다."),
    PAYMENT_AMOUNT_MISMATCH(HttpStatus.BAD_REQUEST, "PAYMENT_AMOUNT_MISMATCH", "결제 금액이 일치하지 않습니다."),

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다."),
    USER_ALREADY_EXISTS(HttpStatus.CONFLICT, "USER_ALREADY_EXISTS", "이미 존재하는 사용자입니다."),

    // Auth
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "인증이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "접근 권한이 없습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "유효하지 않은 토큰입니다."),

    // Kakao
    KAKAO_TOKEN_REQUEST_FAILED(HttpStatus.BAD_GATEWAY, "KAKAO_TOKEN_REQUEST_FAILED", "카카오 토큰 요청에 실패했습니다."),
    KAKAO_USER_INFO_REQUEST_FAILED(HttpStatus.BAD_GATEWAY, "KAKAO_USER_INFO_REQUEST_FAILED", "카카오 사용자 정보 요청에 실패했습니다."),

    // Validation
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "INVALID_INPUT", "입력값이 올바르지 않습니다."),

    // Server
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
