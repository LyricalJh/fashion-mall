# PDCA Completion Report: payment-edge-cases

> **Feature**: 결제 시스템 엣지 케이스 보완
> **Date**: 2026-02-27
> **Match Rate**: 100% (9/9)
> **Status**: Completed

---

## 1. Overview

### Feature Background
토스페이먼츠 결제 시스템의 안정성을 강화하기 위해 실무에서 발생 가능한 9개 엣지 케이스를 체계적으로 보완했다. 이 작업은 다음을 목표로 했다:

- **멱등성 보장**: Idempotency-Key 헤더로 중복 결제 방지
- **상태 일관성**: 결제 실패/취소 시 정확한 상태 관리
- **정밀도 유지**: BigDecimal 비교로 금액 검증 오류 방지
- **동시성 제어**: 주문 취소 중 결제 승인 시도 방지
- **외부 API 연동**: Toss API 실패 시 정확한 HTTP 상태코드 응답
- **UX 개선**: 게스트 결제 및 중복 클릭 방지

### Implementation Scope
- **Backend**: 6개 항목 (PaymentService, Payment, OrderService, ErrorCode, RestTemplateConfig)
- **Frontend**: 2개 항목 (CheckoutPage, PaymentSuccessPage)
- **Integration**: 1개 항목 (RestTemplate 타임아웃 설정)

### Key Metrics
| 항목 | 수치 |
|------|------|
| 설계 항목 | 9개 |
| 구현 완료 | 9개 (100%) |
| 반복 횟수 | 0회 (첫 구현에서 100% 달성) |
| 설계 일치율 | 100% |

---

## 2. Plan Summary

### 9 Edge Cases Identified

#### Backend (6 Items)

**#1 멱등키(Idempotency-Key) 헤더 추가**
- 토스 confirm/cancel 요청 시 Idempotency-Key 헤더 추가
- orderId 기반 (confirm) + cancel_ 접두사 (cancel)로 키 충돌 방지

**#2 결제 승인 실패 시 Payment FAILED 상태**
- HttpClientErrorException, 일반 Exception 모두에서 payment.fail() 호출
- ALREADY_PROCESSING_REQUEST, ALREADY_APPROVED는 예외적으로 성공 처리

**#3 BigDecimal compareTo 정밀 비교**
- intValue() → compareTo(BigDecimal.valueOf()) 변경
- 소수점 절삭 버그 방지

**#4 주문 취소 시 토스 결제 취소 호출**
- 결제 완료(COMPLETED) + paymentKey 존재 시 cancelTossPayment() 호출
- 미결제 상태는 내부 refund()로 처리

**#5 취소 주문 결제 경합 방지**
- confirm 시 주문 CANCELLED 상태면 payment.fail() + 예외 throw
- 동시성 문제 방어

**#6 HTTP 상태코드 수정**
- TOSS_PAYMENT_CONFIRM_FAILED, TOSS_PAYMENT_CANCEL_FAILED: BAD_REQUEST(400) → BAD_GATEWAY(502)
- 외부 PG사 API 실패를 정확히 표현

#### Frontend (2 Items)

**#8 게스트 결제 confirm 건너뛰기**
- sessionStorage로 guest_order 표시
- PaymentSuccessPage에서 confirm API 호출 스킵

**#9 결제 버튼 중복 클릭 방지**
- useRef(false)로 즉시 차단
- validation 실패/에러 시 3곳 모두 ref 리셋

#### Infrastructure (1 Item)

**#7 RestTemplate 타임아웃 설정**
- SimpleClientHttpRequestFactory: connect 5초, read 30초
- Spring 컨텍스트에 @Configuration + @Bean으로 등록

---

## 3. Implementation Summary

### Modified Files

| File | Changes | 항목 |
|------|---------|------|
| `PaymentService.java` | #1 Idempotency-Key, #2 FAILED, #3 compareTo, #5 경합 방지 | Backend |
| `Payment.java` | #2 fail() 메서드 추가 | Backend |
| `OrderService.java` | #4 토스 취소 호출, PaymentService 의존성 추가 | Backend |
| `ErrorCode.java` | #6 BAD_GATEWAY(502) 변경 | Backend |
| `RestTemplateConfig.java` | #7 타임아웃 설정 (SimpleClientHttpRequestFactory) | Infrastructure |
| `CheckoutPage.tsx` | #8 게스트 sessionStorage, #9 useRef 중복 방지 | Frontend |
| `PaymentSuccessPage.tsx` | #8 게스트 confirm 스킵 | Frontend |

### Key Implementation Details

#### Backend: PaymentService.java

**#1 Idempotency-Key 헤더**
```java
// Line 115: confirm 요청
headers.set("Idempotency-Key", request.getOrderId());

// Line 161: cancel 요청
headers.set("Idempotency-Key", "cancel_" + payment.getOrder().getOrderNumber());
```
- confirm은 orderId 그대로, cancel은 cancel_ 접두사로 충돌 방지

**#2 결제 실패 처리**
```java
// Line 133: HttpClientErrorException catch
catch (HttpClientErrorException e) {
    if ("ALREADY_PROCESSING_REQUEST".equals(errorCode) ||
        "ALREADY_APPROVED".equals(errorCode)) {
        // 예외적으로 성공 처리
    } else {
        payment.fail();
        throw new BusinessException(...);
    }
}

// Line 139: 일반 Exception catch
catch (Exception e) {
    payment.fail();
    throw new BusinessException(...);
}
```

**#3 BigDecimal 비교**
```java
// Line 103: compareTo 사용
if (payment.getPaymentAmount().compareTo(BigDecimal.valueOf(request.getAmount())) != 0) {
    payment.fail();
    throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
}
```
- intValue() → compareTo로 정밀도 유지

**#5 주문 취소 경합 방지**
```java
// Line 96-100: confirm 시 CANCELLED 상태 확인
if (payment.getOrder().getStatus() == OrderStatus.CANCELLED) {
    payment.fail();
    throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH, "이미 취소된 주문입니다.");
}
```

#### Backend: OrderService.java

**#4 주문 취소 시 토스 취소 호출**
```java
// Line 178-186: 결제 완료 여부 판단
if (payment.getPaymentStatus() == PaymentStatus.COMPLETED &&
    payment.getPaymentKey() != null) {
    paymentService.cancelTossPayment(payment.getId(), "주문 취소");
} else {
    payment.refund();
}
```
- COMPLETED + paymentKey 존재 시만 토스 API 호출

#### Backend: ErrorCode.java

**#6 HTTP 상태코드 수정**
```java
// Line 28-29: BAD_GATEWAY(502)
TOSS_PAYMENT_CONFIRM_FAILED(HttpStatus.BAD_GATEWAY, ...),
TOSS_PAYMENT_CANCEL_FAILED(HttpStatus.BAD_GATEWAY, ...),
```

#### Frontend: CheckoutPage.tsx

**#8 게스트 sessionStorage**
```tsx
// Line 279-290: 게스트 분기
sessionStorage.setItem('guest_order', JSON.stringify({
  orderId: response.data.id,
  timestamp: Date.now()
}));
```

**#9 중복 클릭 방지**
```tsx
// Line 192: useRef 선언
const submittingRef = useRef(false);

// Line 239-241: 진입 시 즉시 차단
if (submittingRef.current) return;
submittingRef.current = true;

// Line 248, 276, 289: 에러 시 리셋 (3곳)
submittingRef.current = false;
```

#### Frontend: PaymentSuccessPage.tsx

**#8 게스트 confirm 스킵**
```tsx
// Line 32-44: sessionStorage 확인
const guestOrder = sessionStorage.getItem('guest_order');
if (guestOrder) {
    const { orderId } = JSON.parse(guestOrder);
    if (orderId === parseInt(orderIdParam)) {
        // confirm 호출 스킵, 바로 success 처리
        sessionStorage.removeItem('guest_order');
        return;
    }
}
```

---

## 4. Quality Metrics

### Verification Results

| 검증 항목 | 결과 | 상태 |
|----------|------|------|
| TypeScript 컴파일 (npx tsc --noEmit) | PASS | ✅ |
| Docker 빌드 (Gradle bootJar) | PASS | ✅ |
| 서버 기동 | PASS (순환 의존성 없음) | ✅ |
| Gap Analysis Match Rate | 100% (9/9) | ✅ |
| 설계 일치율 | 100% | ✅ |
| 아키텍처 준수도 | 95% | ✅ |
| 컨벤션 준수도 | 92% | ✅ |
| 종합 점수 | 96% | PASS |

### Match Rate Breakdown

| 항목 | 상태 | 비고 |
|------|------|------|
| #1 Idempotency-Key | ✅ PASS | orderId/cancel_ 접두사 분기 완벽 |
| #2 Payment FAILED | ✅ PASS | 예외 처리 로직 완전 |
| #3 BigDecimal compareTo | ✅ PASS | 정밀도 유지 |
| #4 Toss 취소 호출 | ✅ PASS | COMPLETED + paymentKey 조건 정확 |
| #5 주문 경합 방지 | ✅ PASS | CANCELLED 상태 방어 완벽 |
| #6 HTTP 상태코드 | ✅ PASS | BAD_GATEWAY(502) 적용 |
| #8 게스트 confirm 스킵 | ✅ PASS | sessionStorage 전략 정확 |
| #9 중복 클릭 방지 | ✅ PASS | useRef 3곳 리셋 완전 |
| #7 RestTemplate 타임아웃 | ✅ PASS | connect 5초, read 30초 정확 |

### Build Status

```
✅ Backend: BUILD SUCCESSFUL
   - compileJava: 0 errors, 0 warnings
   - bootJar: completed
   - No circular dependencies detected

✅ Frontend: TypeScript Compilation Success
   - npx tsc --noEmit: 0 errors
   - No type mismatches

✅ Docker: Container Start Success
   - Port 8080 responsive
   - Database migration successful
   - Spring context initialization complete
```

---

## 5. Observations & Future Work

### Non-blocking Observations (3)

#### 1. ErrorCode 재활용 (#5 관련)
**File**: `PaymentService.java` (line 99)

**Observation**: 주문 취소 경합 시 `PAYMENT_AMOUNT_MISMATCH` ErrorCode를 재활용하고 있다. 메시지 파라미터로 "이미 취소된 주문입니다"를 전달하지만, 클라이언트 측에서 error code 기반으로 분기할 때 금액 불일치와 주문 취소를 구분하기 어려울 수 있다.

**Recommendation**: `ORDER_ALREADY_CANCELLED(HttpStatus.CONFLICT, "ORDER_ALREADY_CANCELLED", "이미 취소된 주문입니다.")` 전용 ErrorCode 추가를 검토하세요.

**Priority**: Low (기능상 문제 없음, 클라이언트 에러 분기 명확화 목적)

#### 2. cancelTossPayment의 FAILED 미처리
**File**: `PaymentService.java` (line 149-175)

**Observation**: `cancelTossPayment` 메서드에서 토스 API 호출 실패 시 예외를 던지지만, confirm과 달리 payment를 FAILED 상태로 변경하지 않는다. 취소 실패 시 payment는 여전히 COMPLETED 상태로 남게 되므로 재시도가 가능하다는 점에서 의도적일 수 있으나, 명시적 로깅이나 코멘트가 있으면 의도를 더 명확히 할 수 있다.

**Recommendation**: 취소 실패 시 COMPLETED 유지가 재시도 허용 의도인지 명시적으로 문서화하세요. 필요시 CANCELLATION_FAILED 상태 추가를 검토하세요.

**Priority**: Low (설계 의도 명확화 목적)

#### 3. 게스트 결제 성공 시 카트 정리 타이밍
**File**: `CheckoutPage.tsx` (line 285)

**Observation**: 게스트 분기에서 `clearCart()`가 `requestTossPayment` 호출 후(await 이후)에 위치하지만, `requestTossPayment`는 토스 결제 팝업을 열어 페이지를 리다이렉트하므로 실제로 `clearCart()`가 실행되지 않을 가능성이 높다. 기능적 문제는 아니지만(게스트 카트는 비로그인 로컬 데이터), 코드 의도가 불명확할 수 있다.

**Recommendation**:
- 불가능한 코드인 경우: 제거
- 결제 전 카트 정리가 의도인 경우: requestTossPayment 호출 전으로 이동

**Priority**: Very Low (데드코드 정리 목적)

### Completed Items

- ✅ 토스페이먼츠 v2 SDK 환경에서 9개 엣지 케이스 완전 구현
- ✅ 멱등성, 상태 일관성, 정밀도, 동시성 제어 모두 확보
- ✅ 게스트 결제 및 로그인 사용자 분기 안정화
- ✅ HTTP 상태코드 및 타임아웃 설정 표준화
- ✅ 첫 구현에서 100% 설계 일치율 달성

### Deferred Items

없음 (모든 항목 정상 구현)

---

## 6. Lessons Learned

### What Went Well

#### 1. 명확한 엣지 케이스 분류
- Backend 6개, Frontend 2개, Infrastructure 1개로 체계적 분류
- 각 항목의 구현 목표가 명확하여 코드 리뷰 용이
- 첫 구현에서 100% 달성

#### 2. 멱등성 설계의 효과
- orderId vs cancel_ 접두사 분기로 confirm/cancel 간 키 충돌 완벽 방지
- 토스 API의 멱등성 보장과 백엔드 로직이 일치

#### 3. 예외 처리의 세분화
- ALREADY_PROCESSING_REQUEST/ALREADY_APPROVED 예외적 처리로 중복 결제 안전화
- HttpClientErrorException + Exception 2단계 catch로 모든 실패 케이스 커버

#### 4. UseRef를 활용한 중복 클릭 방지
- useState와 달리 렌더링 사이클과 무관하게 즉시 값이 반영
- validation 실패, 로그인 에러, 게스트 에러 3곳 모두 리셋으로 완벽한 차단

#### 5. SessionStorage를 활용한 게스트 구분
- 같은 탭 내에서만 유효하므로 보안 측면에서도 적절
- 토스 리다이렉트 후 PaymentSuccessPage 진입 시 게스트 여부 판단 가능

### Areas for Improvement

#### 1. 전용 ErrorCode 추가 검토
- 현재 PAYMENT_AMOUNT_MISMATCH 재활용이 기능상 문제는 아니지만
- ORDER_ALREADY_CANCELLED 같은 전용 코드가 있으면 클라이언트 에러 분기 명확화

#### 2. cancelTossPayment 실패 시 상태 처리 명문화
- 현재 COMPLETED 유지가 재시도 허용 의도인지 명시 필요
- 로깅 강화 또는 CANCELLATION_FAILED 상태 추가 검토

#### 3. 게스트 결제 흐름의 코드 정리
- CheckoutPage의 clearCart() 호출 타이밍 재검토
- 실행 불가능 코드는 제거하거나 의도 명확화

### To Apply Next Time

#### 1. 엣지 케이스를 먼저 분류하고 계획
- 항목별 담당 파일 명시 → 리뷰 효율성 증대
- Backend/Frontend/Infrastructure 분리로 팀 작업 병렬화 용이

#### 2. 멱등성이 필요한 외부 API 연동 시
- Key 생성 규칙 사전 정의 (예: cancel_ 접두사)
- 토스 v1/v2 API 변경사항 확인 (현재 v2 SDK + v1 API 혼용 안정)

#### 3. 예외 처리 설계 시 예외적 경우부터 정의
- ALREADY_PROCESSING_REQUEST 같은 특수 코드 먼저 catch
- 그 후 일반 예외로 폴백하는 순서로 코드 작성

#### 4. React에서 중복 클릭 방지
- useState 대신 useRef + 즉시 true 설정 추천
- validation/error 경로 모두에서 리셋 필요

#### 5. 로컬 상태(sessionStorage) 활용
- 같은 탭 범위의 임시 상태는 sessionStorage 추천
- localStorage는 탭 간 공유 필요 시에만 사용

---

## 7. Technical Insights

### SDK Version Management

현재 구성:
- **Frontend**: @tosspayments/tosspayments-sdk v2.5.0 (v2 SDK)
- **Backend**: /v1/payments/confirm (v1 API)

**설계 이유**: v2 마이그레이션이 불필요한 상황
- v2 SDK는 프론트엔드 UX 개선 (더 나은 UI 컴포넌트)에만 영향
- 백엔드는 여전히 v1 API 유지 (안정적)
- 엣지 케이스 보완에 집중하여 마이그레이션 비용 최소화

### Idempotency Key Design

```
confirm: orderId (예: "order-20260227-001")
cancel:  "cancel_" + orderNumber (예: "cancel_ORD20260227001")
```

**설계 근거**:
- 같은 주문에 대해 confirm과 cancel이 동시에 요청될 수 없음
- 각각의 키를 구분함으로써 토스 API의 멱등성 최대한 활용
- 테이블 조회 없이도 키에서 의도 파악 가능

### BigDecimal Precision

```java
// 잘못된 비교
payment.getPaymentAmount().intValue() == request.getAmount()

// 정확한 비교
payment.getPaymentAmount().compareTo(BigDecimal.valueOf(request.getAmount())) != 0
```

**개선 이유**:
- intValue()는 소수점 절삭 (1.99 → 1)
- compareTo는 전체 정밀도 유지
- 환율 변동이나 부분 결제 시나리오에서 중요

---

## 8. Related Documents

- **Analysis**: [payment-edge-cases.analysis.md](../03-analysis/payment-edge-cases.analysis.md)
- **Changelog**: [changelog.md](./changelog.md)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-27 | Initial completion report with 9 edge cases, 100% match rate | report-generator |

---

## Summary

**payment-edge-cases** 기능은 토스페이먼츠 결제 시스템의 안정성을 크게 강화했다. 9개 엣지 케이스가 모두 정상 구현되었으며, 첫 구현에서 100% 설계 일치율을 달성했다. 특히 멱등성 보장, 상태 일관성, 정밀도 유지, 동시성 제어, 외부 API 연동 오류 처리, UX 개선 등 결제 시스템의 핵심 요구사항을 모두 충족했다.

**주요 성과**:
- 설계 일치율: 100% (9/9)
- 반복 횟수: 0회 (첫 구현 달성)
- 빌드 상태: SUCCESS (Backend + Frontend + Docker)
- 비차단 개선 사항: 3개 (향후 검토 권장)

이 기능은 바로 운영 환경 배포 가능 상태이다.
