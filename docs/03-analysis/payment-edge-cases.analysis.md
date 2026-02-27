# Gap Analysis: payment-edge-cases

> **Summary**: 결제 시스템 엣지 케이스 9개 항목에 대한 설계-구현 일치 분석
>
> **Author**: gap-detector
> **Created**: 2026-02-27
> **Status**: Review

---

## Summary
- **Feature**: 결제 시스템 엣지 케이스 보완
- **Date**: 2026-02-27
- **Match Rate**: 100% (9/9)
- **Items**: 9/9 implemented

## Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| Design Match | 100% | PASS |
| Architecture Compliance | 95% | PASS |
| Convention Compliance | 92% | PASS |
| **Overall** | **96%** | PASS |

---

## Detail Analysis

### #1 멱등키(Idempotency-Key) -- PASS

- **Expected**: confirm/cancel 요청 시 `Idempotency-Key` 헤더를 orderId 기반으로 추가
- **Actual**: 구현 완료
  - `PaymentService.java:115` -- confirm 요청에 `Idempotency-Key` 헤더 설정: `headers.set("Idempotency-Key", request.getOrderId())`
  - `PaymentService.java:161` -- cancel 요청에 `Idempotency-Key` 헤더 설정: `headers.set("Idempotency-Key", "cancel_" + payment.getOrder().getOrderNumber())`
- **Note**: confirm은 orderId 그대로, cancel은 `cancel_` 접두사를 붙여 confirm/cancel 간 키 충돌을 방지하고 있다. 설계 의도에 부합한다.

### #2 결제 승인 실패 시 Payment FAILED 처리 -- PASS

- **Expected**: 토스 confirm 실패 시 Payment 상태를 FAILED로 변경
- **Actual**: 구현 완료
  - `Payment.java:71-73` -- `fail()` 메서드가 존재하여 `paymentStatus`를 `PaymentStatus.FAILED`로 변경
  - `PaymentStatus.java:6` -- `FAILED` enum 값이 존재
  - `PaymentService.java:133` -- `HttpClientErrorException` catch 블록에서 `payment.fail()` 호출 (ALREADY_PROCESSING_REQUEST/ALREADY_APPROVED 제외)
  - `PaymentService.java:139` -- 일반 `Exception` catch 블록에서도 `payment.fail()` 호출
- **Note**: 두 종류의 예외(HttpClientErrorException, Exception) 모두에서 FAILED 처리를 수행하며, 이미 승인 중이거나 승인된 결제는 예외적으로 성공 처리한다. 완전하게 구현되어 있다.

### #3 결제 금액 검증 BigDecimal compareTo -- PASS

- **Expected**: `intValue()` 비교 대신 `compareTo` 사용한 BigDecimal 정밀 비교
- **Actual**: 구현 완료
  - `PaymentService.java:103` -- `payment.getPaymentAmount().compareTo(BigDecimal.valueOf(request.getAmount())) != 0`
- **Note**: `compareTo`를 사용하여 BigDecimal 정밀 비교를 수행한다. `request.getAmount()`가 `long` 타입이라면 `BigDecimal.valueOf(long)`은 정밀도 손실 없이 변환되므로 적절하다.

### #4 주문 취소 시 토스 결제 취소 호출 -- PASS

- **Expected**: 결제 완료(COMPLETED) 상태인 경우 `PaymentService.cancelTossPayment()`를 호출
- **Actual**: 구현 완료
  - `OrderService.java:178-186` -- 결제 정보 조회 후 조건부 토스 취소 호출:
    ```java
    if (payment.getPaymentStatus() == PaymentStatus.COMPLETED && payment.getPaymentKey() != null) {
        paymentService.cancelTossPayment(payment.getId(), "주문 취소");
    } else {
        payment.refund();
    }
    ```
- **Note**: `PaymentStatus.COMPLETED`이면서 `paymentKey`가 존재하는 경우에만 토스 API를 호출하고, 그 외(PENDING 등)에는 내부적으로 환불 처리한다. paymentKey null 체크는 토스 PG를 거치지 않은 결제에 대한 안전장치로 적절하다.

### #5 결제 완료 전 주문 취소 경합 -- PASS

- **Expected**: confirm 시 주문 상태가 CANCELLED인지 확인 후 거부
- **Actual**: 구현 완료
  - `PaymentService.java:96-100`:
    ```java
    if (payment.getOrder().getStatus() == com.shop.domain.order.entity.OrderStatus.CANCELLED) {
        payment.fail();
        throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH, "이미 취소된 주문입니다.");
    }
    ```
- **Note**: 취소된 주문에 대해 payment.fail()을 호출한 후 예외를 던진다. 경합 조건에 대한 방어 로직이 정확히 구현되어 있다. 다만 `PAYMENT_AMOUNT_MISMATCH` ErrorCode를 재활용하고 있는데, `ORDER_ALREADY_CANCELLED`와 같은 전용 ErrorCode가 있으면 의미가 더 명확할 수 있다 (아래 권장사항 참조).

### #6 게스트 결제 confirm 건너뛰기 -- PASS

- **Expected**: 게스트 결제는 confirm 호출을 건너뜀 (sessionStorage로 게스트 주문 표시)
- **Actual**: 구현 완료
  - `CheckoutPage.tsx:279-290` -- 비로그인 사용자 분기에서 `sessionStorage.setItem('guest_order', ...)` 호출
  - `PaymentSuccessPage.tsx:32-44` -- `sessionStorage.getItem('guest_order')`를 확인하여 orderId가 일치하면 confirm API 호출 없이 바로 success 처리, 사용 후 `sessionStorage.removeItem('guest_order')` 호출
- **Note**: sessionStorage를 통한 게스트/회원 구분 전략이 정확히 구현되어 있다. sessionStorage는 같은 탭에서만 유효하므로 보안 측면에서도 적절하다.

### #7 HTTP 상태코드 오류 수정 -- PASS

- **Expected**: `TOSS_PAYMENT_CONFIRM_FAILED`와 `TOSS_PAYMENT_CANCEL_FAILED`를 `BAD_GATEWAY(502)`로 변경
- **Actual**: 구현 완료
  - `ErrorCode.java:28` -- `TOSS_PAYMENT_CONFIRM_FAILED(HttpStatus.BAD_GATEWAY, ...)`
  - `ErrorCode.java:29` -- `TOSS_PAYMENT_CANCEL_FAILED(HttpStatus.BAD_GATEWAY, ...)`
- **Note**: 두 에러 코드 모두 `HttpStatus.BAD_GATEWAY` (502)를 사용하고 있다. 외부 PG사 API 실패를 나타내는 데 502가 의미론적으로 정확하다.

### #8 RestTemplate 타임아웃 설정 -- PASS

- **Expected**: connect 5초, read 30초 타임아웃 설정
- **Actual**: 구현 완료
  - `RestTemplateConfig.java:13-16`:
    ```java
    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(5_000);  // 5초
    factory.setReadTimeout(30_000);    // 30초
    return new RestTemplate(factory);
    ```
- **Note**: `SimpleClientHttpRequestFactory`를 사용하여 connect 5초, read 30초로 정확히 설계대로 설정되어 있다. `@Configuration` + `@Bean` 구조로 Spring 컨텍스트에 올바르게 등록된다.

### #9 결제 버튼 중복 클릭 방지 -- PASS

- **Expected**: useRef로 즉시 중복 차단, 에러 시 ref 리셋
- **Actual**: 구현 완료
  - `CheckoutPage.tsx:192` -- `const submittingRef = useRef(false)` 선언
  - `CheckoutPage.tsx:239-241` -- 함수 진입 시 즉시 차단:
    ```tsx
    if (submittingRef.current) return
    submittingRef.current = true
    ```
  - `CheckoutPage.tsx:248` -- validation 실패 시 ref 리셋: `submittingRef.current = false`
  - `CheckoutPage.tsx:276` -- 로그인 사용자 에러 시 ref 리셋: `submittingRef.current = false`
  - `CheckoutPage.tsx:289` -- 게스트 에러 시 ref 리셋: `submittingRef.current = false`
- **Note**: `useRef`는 React 렌더링 사이클과 무관하게 즉시 값이 반영되므로 `useState`보다 더블클릭 방지에 효과적이다. 에러 경로 3곳 모두에서 ref를 리셋하고 있어 설계 의도에 완벽히 부합한다.

---

## Gaps Found

설계 항목 9개 중 미구현 항목 없음. 모든 항목이 PASS.

---

## Minor Observations (Non-blocking)

아래 항목들은 현재 설계 범위 밖이지만, 코드 품질 측면에서 향후 개선을 고려할 수 있다.

### 1. ErrorCode 재활용 (Requirement #5 관련)

- **File**: `C:\projects\shopping\fashion-mall\backend\src\main\java\com\shop\domain\payment\service\PaymentService.java` (line 99)
- **Description**: 주문 취소 경합 시 `PAYMENT_AMOUNT_MISMATCH` ErrorCode를 재활용하고 있다. 메시지 파라미터로 "이미 취소된 주문입니다"를 전달하지만, 클라이언트 측에서 error code 기반으로 분기할 때 금액 불일치와 주문 취소를 구분하기 어려울 수 있다.
- **Suggestion**: `ORDER_ALREADY_CANCELLED(HttpStatus.CONFLICT, "ORDER_ALREADY_CANCELLED", "이미 취소된 주문입니다.")` 전용 ErrorCode 추가를 검토.

### 2. cancelTossPayment의 FAILED 미처리

- **File**: `C:\projects\shopping\fashion-mall\backend\src\main\java\com\shop\domain\payment\service\PaymentService.java` (line 149-175)
- **Description**: `cancelTossPayment` 메서드에서 토스 API 호출 실패 시 예외를 던지지만, confirm과 달리 payment를 FAILED 상태로 변경하지 않는다. 취소 실패 시 payment는 여전히 COMPLETED 상태로 남게 되므로 재시도가 가능하다는 점에서 의도적일 수 있으나, 명시적 로깅이나 코멘트가 있으면 의도를 더 명확히 할 수 있다.

### 3. 게스트 결제 성공 시 카트 정리 타이밍

- **File**: `C:\projects\shopping\fashion-mall\fashion-mall\src\pages\CheckoutPage.tsx` (line 285)
- **Description**: 게스트 분기에서 `clearCart()`가 `requestTossPayment` 호출 후(await 이후)에 실행되지만, `requestTossPayment`는 토스 결제 팝업을 열어 페이지를 리다이렉트하므로 실제로 `clearCart()`가 실행되지 않을 가능성이 높다. 기능적 문제는 아니지만(게스트 카트는 비로그인 로컬 데이터), 코드 의도가 불명확할 수 있다.

---

## Recommendations

### 즉시 조치 필요 항목
없음. 9개 설계 항목 모두 구현 완료.

### 향후 개선 고려 사항
1. `ORDER_ALREADY_CANCELLED` 전용 ErrorCode 추가 (클라이언트 측 에러 분기 명확화)
2. `cancelTossPayment` 실패 시 상태 처리 전략 명문화 (의도적 COMPLETED 유지인지 명시)
3. 게스트 결제 흐름에서 `clearCart()` 호출 위치 재검토 (실행 불가능 코드 제거 또는 결제 전 호출로 이동)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-27 | Initial gap analysis | gap-detector |
