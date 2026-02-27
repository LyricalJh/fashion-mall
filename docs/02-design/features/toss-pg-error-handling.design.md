# Design: Toss PG 에러 핸들링 검증 및 개선

> Feature: `toss-pg-error-handling`
> Plan: `docs/01-plan/features/toss-pg-error-handling.plan.md`
> Created: 2026-02-27
> Status: Design

## 1. 구현 순서

```
1. [BE] ErrorCode.java — 에러 코드 추가 (M1)
2. [BE] PaymentService.java — Toss 에러 파싱 + 금액 검증 + 취소 로그 (H1, H3, M2)
3. [BE] Payment.java — 상태 전이 로깅 (L1)
4. [FE] PaymentSuccessPage.tsx — 에러 코드별 메시지 분류 + 게스트 검증 (H2, M3)
5. [FE] CheckoutPage.tsx — 도달 불가 코드 정리 (L2)
```

## 2. 상세 설계

### 2.1 [BE] ErrorCode.java — 에러 코드 추가 (M1)

**현재**: `PAYMENT_AMOUNT_MISMATCH`를 금액 불일치 + 취소된 주문에 동시 사용

**변경**:

```java
// Payment 섹션에 추가
ORDER_ALREADY_CANCELLED(HttpStatus.BAD_REQUEST, "ORDER_ALREADY_CANCELLED", "이미 취소된 주문입니다."),
```

**변경 위치**: `ErrorCode.java:30` 뒤에 추가

---

### 2.2 [BE] PaymentService.java — Toss 에러 파싱 (H1, H3, M2)

#### 2.2.1 Toss 에러 응답 파싱 헬퍼 메서드 추가

**현재**: `HttpClientErrorException` catch에서 `responseBody.contains("ALREADY_...")` 문자열 체크만 수행
**변경**: JSON 파싱으로 `code`/`message` 추출, 내부 로그와 사용자 메시지 분리

```java
// PaymentService 클래스 내 private 메서드 추가
private Map<String, String> parseTossError(String responseBody) {
    try {
        com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
        com.fasterxml.jackson.databind.JsonNode node = om.readTree(responseBody);
        String code = node.has("code") ? node.get("code").asText() : "UNKNOWN";
        String message = node.has("message") ? node.get("message").asText() : responseBody;
        return Map.of("code", code, "message", message);
    } catch (Exception e) {
        return Map.of("code", "UNKNOWN", "message", responseBody);
    }
}

private String toUserMessage(String tossCode) {
    return switch (tossCode) {
        case "ALREADY_PROCESSING_PAYMENT", "ALREADY_APPROVED" -> null; // 성공 케이스
        case "NOT_FOUND_PAYMENT_SESSION" -> "결제 시간이 만료되었습니다. 다시 시도해 주세요.";
        case "REJECT_CARD_COMPANY" -> "카드사에서 결제를 거절했습니다. 다른 카드로 시도해 주세요.";
        case "FORBIDDEN_REQUEST" -> "결제 요청 정보가 올바르지 않습니다.";
        case "UNAUTHORIZED_KEY" -> "결제 처리 중 오류가 발생했습니다.";
        default -> "결제 승인에 실패했습니다.";
    };
}
```

#### 2.2.2 confirmTossPayment 에러 핸들링 리팩토링

**현재** (`PaymentService.java:97-99`):
```java
if (payment.getOrder().getStatus() == OrderStatus.CANCELLED) {
    payment.fail();
    throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH, "이미 취소된 주문입니다.");
}
```

**변경**: 에러 코드 분리
```java
if (payment.getOrder().getStatus() == OrderStatus.CANCELLED) {
    payment.fail();
    throw new BusinessException(ErrorCode.ORDER_ALREADY_CANCELLED);
}
```

#### 2.2.3 주문 총액 vs 결제 금액 교차 검증 (H3)

**현재**: `payment.getPaymentAmount()` vs `request.getAmount()` 비교만 수행
**변경**: DB 주문 총액과도 비교

```java
// 기존 paymentAmount 비교 직후에 추가 (line 103-105 뒤)
BigDecimal orderTotal = payment.getOrder().getTotalPrice();
if (orderTotal != null && orderTotal.compareTo(BigDecimal.valueOf(request.getAmount())) != 0) {
    log.error("Order total mismatch: order={}, request={}", orderTotal, request.getAmount());
    throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH, "주문 금액과 결제 금액이 일치하지 않습니다.");
}
```

#### 2.2.4 HttpClientErrorException에서 Toss 에러 파싱 적용

**현재** (`PaymentService.java:125-135`):
```java
catch (HttpClientErrorException e) {
    String responseBody = e.getResponseBodyAsString();
    if (responseBody.contains("ALREADY_PROCESSING_REQUEST") || responseBody.contains("ALREADY_APPROVED")) {
        log.warn("Toss payment already processing/approved: {}", responseBody);
    } else {
        log.error("Toss payment confirm failed: {}", e.getMessage(), e);
        payment.fail();
        throw new BusinessException(ErrorCode.TOSS_PAYMENT_CONFIRM_FAILED);
    }
}
```

**변경**:
```java
catch (org.springframework.web.client.HttpClientErrorException e) {
    String responseBody = e.getResponseBodyAsString();
    Map<String, String> tossError = parseTossError(responseBody);
    String tossCode = tossError.get("code");
    String tossMessage = tossError.get("message");

    // 이미 처리 중이거나 이미 승인된 결제는 성공으로 처리 (멱등성)
    if ("ALREADY_PROCESSING_PAYMENT".equals(tossCode) || "ALREADY_APPROVED".equals(tossCode)) {
        log.warn("Toss payment already processing/approved: code={}, orderId={}", tossCode, request.getOrderId());
    } else {
        log.error("Toss payment confirm failed: code={}, message={}, orderId={}", tossCode, tossMessage, request.getOrderId());
        payment.fail();
        String userMessage = toUserMessage(tossCode);
        throw new BusinessException(ErrorCode.TOSS_PAYMENT_CONFIRM_FAILED, userMessage);
    }
}
```

#### 2.2.5 cancelTossPayment 에러 로그 강화 (M2)

**현재** (`PaymentService.java:168-170`):
```java
catch (Exception e) {
    log.error("Toss payment cancel failed: {}", e.getMessage(), e);
    throw new BusinessException(ErrorCode.TOSS_PAYMENT_CANCEL_FAILED);
}
```

**변경**:
```java
catch (org.springframework.web.client.HttpClientErrorException e) {
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
```

---

### 2.3 [BE] Payment.java — 상태 전이 로깅 (L1)

**현재**: `complete()`, `fail()`, `refund()` 메서드에 로그 없음

**변경**: 각 상태 전이 메서드에 로그 추가. Entity에서 직접 로깅하기 어려우므로(static logger 필요) **PaymentService에서 로깅**하는 방식으로 변경.

```java
// PaymentService.confirmTossPayment() 내 — complete 전
log.info("Payment completing: paymentId={}, orderId={}, amount={}",
         payment.getId(), request.getOrderId(), request.getAmount());

// PaymentService.confirmTossPayment() 내 — fail 시
log.info("Payment failed: paymentId={}, orderId={}", payment.getId(), request.getOrderId());

// PaymentService.cancelTossPayment() 내 — refund 전
log.info("Payment refunding: paymentId={}, paymentKey={}", payment.getId(), payment.getPaymentKey());
```

---

### 2.4 [FE] PaymentSuccessPage.tsx — 에러 코드별 메시지 분류 (H2, M3)

#### 2.4.1 에러 응답에서 code 추출

**현재**: `apiClient.ts:94-97`에서 `json.error?.message`만 throw
**API 응답 구조**: `{ success: false, error: { code: "TOSS_PAYMENT_CONFIRM_FAILED", message: "..." } }`

**변경**: `apiClient.ts`의 `parseResponse`에서 code도 함께 전달하도록 커스텀 Error 클래스 사용

```typescript
// apiClient.ts 상단에 추가
export class ApiError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.name = 'ApiError'
  }
}

// parseResponse 내 에러 throw 변경
if (!res.ok || !json.success) {
  const code = json.error?.code ?? `HTTP_${res.status}`
  const message = json.error?.message ?? `HTTP ${res.status}`
  throw new ApiError(code, message)
}
```

#### 2.4.2 PaymentSuccessPage 에러 핸들링 개선

**현재** (`PaymentSuccessPage.tsx:56-60`):
```tsx
catch (err) {
  if (!cancelled) {
    setStatus('error')
    setErrorMessage(err instanceof Error ? err.message : '결제 승인에 실패했습니다.')
  }
}
```

**변경**:
```tsx
catch (err) {
  if (!cancelled) {
    setStatus('error')
    if (err instanceof ApiError) {
      setErrorMessage(err.message)  // 백엔드에서 보낸 사용자 친화적 메시지
      setErrorCode(err.code)        // 에러 코드 (UI 분기용)
    } else {
      setErrorMessage(err instanceof Error ? err.message : '결제 승인에 실패했습니다.')
    }
  }
}
```

**state 추가**:
```tsx
const [errorCode, setErrorCode] = useState('')
```

**에러 UI에 코드별 안내 추가**:
```tsx
// 에러 상태 렌더링 부분에서
<p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
{errorCode === 'TOSS_PAYMENT_CONFIRM_FAILED' && (
  <p className="mt-1 text-xs text-gray-400">문제가 지속되면 고객센터로 문의해 주세요.</p>
)}
```

#### 2.4.3 게스트 결제 검증 강화 (M3)

**현재**: guest_order가 있으면 무조건 성공 처리
**변경**: guest_order 매칭 시 amount도 검증

```tsx
// PaymentSuccessPage.tsx:32-43 변경
const guestOrderData = sessionStorage.getItem('guest_order')
if (guestOrderData) {
  try {
    const guestOrder = JSON.parse(guestOrderData)
    if (guestOrder.orderId === orderId && String(guestOrder.amount) === amount) {
      sessionStorage.removeItem('guest_order')
      setStatus('success')
      return
    }
  } catch {
    // JSON 파싱 실패 시 정상 confirm 플로우로 진행
  }
}
```

---

### 2.5 [FE] CheckoutPage.tsx — 도달 불가 코드 정리 (L2)

**현재** (`CheckoutPage.tsx:285`):
```tsx
if (!directItem) clearCart()
```
이 줄은 `requestTossPayment()` 후에 위치하여 Toss 리다이렉트 때문에 실행되지 않음.

**변경**: 해당 줄 제거. 게스트 장바구니 비우기는 PaymentSuccessPage에서 처리.

```tsx
// CheckoutPage.tsx 게스트 플로우 (line 280-291) 변경
try {
  const orderId = `ORD${Date.now()}`
  sessionStorage.setItem('guest_order', JSON.stringify({ orderId, amount: finalPrice }))
  await requestTossPayment(orderId, finalPrice, `주문 ${orderId}`, `guest_${Date.now()}`)
  // Toss 리다이렉트로 여기까지 도달하지 않음
} catch (err) {
  setErrors([err instanceof Error ? err.message : '결제 처리에 실패했습니다.'])
  setSubmitting(false)
  submittingRef.current = false
}
```

**PaymentSuccessPage에서 게스트 장바구니 정리 추가**:
```tsx
// 게스트 성공 처리 시 (기존 guest_order 제거 직전)
if (guestOrder.orderId === orderId && String(guestOrder.amount) === amount) {
  sessionStorage.removeItem('guest_order')
  // 게스트 장바구니 정리
  const { getState } = await import('../store/useStore')
  getState().clearCart()
  setStatus('success')
  return
}
```

## 3. 영향 범위 매트릭스

| 파일 | 변경 유형 | 관련 항목 | 라인 수 (예상) |
|------|-----------|-----------|---------------|
| `ErrorCode.java` | 1줄 추가 | M1 | +1 |
| `PaymentService.java` | 메서드 2개 추가 + 기존 메서드 수정 | H1, H3, M2, L1 | ~+40, ~20 수정 |
| `apiClient.ts` | ApiError 클래스 추가 + parseResponse 수정 | H2 | +10, ~3 수정 |
| `PaymentSuccessPage.tsx` | 에러 분류 + 게스트 검증 | H2, M3 | ~+10, ~5 수정 |
| `CheckoutPage.tsx` | 1줄 제거 | L2 | -1 |

## 4. 데이터 흐름

```
[ Toss API 에러 발생 ]
    │
    ▼
PaymentService.confirmTossPayment()
    │  catch HttpClientErrorException
    │  → parseTossError(responseBody)  ← JSON { code, message } 파싱
    │  → 멱등 코드(ALREADY_*) → 성공으로 처리
    │  → 기타 코드 → payment.fail()
    │               → toUserMessage(tossCode) ← 사용자 메시지 매핑
    │               → throw BusinessException(TOSS_PAYMENT_CONFIRM_FAILED, userMessage)
    │
    ▼
GlobalExceptionHandler.handleBusinessException()
    │  → ApiResponse.fail(code, message)
    │  → HTTP 502 { success: false, error: { code, message } }
    │
    ▼
apiClient.parseResponse()
    │  → throw new ApiError(code, message)
    │
    ▼
PaymentSuccessPage
    │  catch ApiError
    │  → setErrorMessage(err.message)  ← 사용자 친화적 메시지
    │  → setErrorCode(err.code)        ← UI 분기용
    │
    ▼
[ 사용자에게 적절한 안내 메시지 표시 ]
```

## 5. 에러 코드 매핑 테이블

| Toss 에러 코드 | 내부 ErrorCode | 사용자 메시지 |
|---------------|---------------|--------------|
| `ALREADY_PROCESSING_PAYMENT` | (성공 처리) | - |
| `ALREADY_APPROVED` | (성공 처리) | - |
| `NOT_FOUND_PAYMENT_SESSION` | `TOSS_PAYMENT_CONFIRM_FAILED` | 결제 시간이 만료되었습니다. 다시 시도해 주세요. |
| `REJECT_CARD_COMPANY` | `TOSS_PAYMENT_CONFIRM_FAILED` | 카드사에서 결제를 거절했습니다. 다른 카드로 시도해 주세요. |
| `FORBIDDEN_REQUEST` | `TOSS_PAYMENT_CONFIRM_FAILED` | 결제 요청 정보가 올바르지 않습니다. |
| `UNAUTHORIZED_KEY` | `TOSS_PAYMENT_CONFIRM_FAILED` | 결제 처리 중 오류가 발생했습니다. |
| 기타/알 수 없음 | `TOSS_PAYMENT_CONFIRM_FAILED` | 결제 승인에 실패했습니다. |

## 6. 체크리스트

- [ ] `ErrorCode.ORDER_ALREADY_CANCELLED` 추가됨
- [ ] `parseTossError()` 메서드가 Toss JSON 응답의 code/message를 정확히 파싱
- [ ] `toUserMessage()` 메서드가 주요 Toss 에러 코드를 사용자 친화적 메시지로 매핑
- [ ] `confirmTossPayment()`에서 주문 총액과 결제 금액 교차 검증
- [ ] `cancelTossPayment()`에서 HttpClientErrorException 별도 catch + Toss 에러 로그
- [ ] 결제 완료/실패/환불 시 info 로그 기록
- [ ] `ApiError` 클래스가 code와 message를 분리 전달
- [ ] `PaymentSuccessPage`에서 errorCode 기반 UI 분기
- [ ] 게스트 결제 amount 검증 추가
- [ ] 도달 불가 `clearCart()` 제거, PaymentSuccessPage에서 처리
- [ ] 기존 정상 결제 플로우가 깨지지 않음
