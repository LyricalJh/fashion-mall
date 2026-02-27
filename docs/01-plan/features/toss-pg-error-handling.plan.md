# Plan: Toss PG 에러 핸들링 검증 및 개선

> Feature: `toss-pg-error-handling`
> Created: 2026-02-27
> Status: Plan

## 1. 개요

Toss Payments PG 연동의 에러 핸들링이 올바르게 구현되어 있는지 검증하고, 부족한 부분을 수정한다.
Toss MCP를 활용하여 공식 문서의 에러 코드/처리 가이드와 현재 코드를 대조 검증한다.

## 2. 현재 상태 분석

### 2.1 잘 되어 있는 부분 (강점)

| 항목 | 설명 |
|------|------|
| Idempotency-Key | 결제 승인(orderId), 취소(cancel_ prefix) 모두 적용 |
| BigDecimal 비교 | `.compareTo()` 사용 (truncation 방지) |
| 2-Layer Exception | HttpClientErrorException + General Exception 분리 처리 |
| 중복 클릭 방지 | useRef(submittingRef)로 프론트엔드 이중 제출 차단 |
| HTTP 상태 코드 | 외부 API 실패 시 502 BAD_GATEWAY 사용 |
| 타임아웃 설정 | RestTemplate connect 5s, read 30s |
| Payment 상태 머신 | PENDING → COMPLETED/FAILED/REFUNDED 상태 전이 |

### 2.2 발견된 문제점 (Gap)

#### HIGH - 반드시 수정

| # | 문제 | 설명 | 위치 |
|---|------|------|------|
| H1 | Toss 에러 응답 파싱 부재 | 백엔드에서 Toss API 에러 응답의 `code`/`message`를 파싱하지 않고 generic exception만 전달 | PaymentService.java |
| H2 | 프론트엔드 에러 메시지 미분류 | 모든 결제 에러를 단일 문자열로 표시, Toss 에러코드별 사용자 친화적 메시지 없음 | PaymentSuccessPage.tsx |
| H3 | 주문 총액 vs 결제 금액 검증 누락 | confirm 시 request amount만 비교, 실제 주문 총액(DB)과 비교 안 함 → 금액 변조 가능 | PaymentService.java |

#### MEDIUM - 개선 권장

| # | 문제 | 설명 | 위치 |
|---|------|------|------|
| M1 | ErrorCode 재사용 | `PAYMENT_AMOUNT_MISMATCH`를 금액 불일치 + 취소된 주문에 동시 사용 | ErrorCode.java |
| M2 | 취소 실패 시 상태 미변경 | cancelTossPayment()에서 Toss API 실패해도 Payment 상태가 COMPLETED로 유지 | PaymentService.java |
| M3 | 게스트 결제 confirm 스킵 | guest_order가 있으면 서버 검증 없이 성공 처리 → 실제 결제 상태 미확인 | PaymentSuccessPage.tsx |

#### LOW - 선택 개선

| # | 문제 | 설명 | 위치 |
|---|------|------|------|
| L1 | 결제 상태 전이 로깅 부재 | complete/fail/refund 호출 시 info 레벨 로그 없음 | Payment.java |
| L2 | clearCart() 도달 불가 코드 | 게스트 플로우에서 requestTossPayment 후 clearCart()는 리다이렉트로 실행 안 됨 | CheckoutPage.tsx |

## 3. Toss 공식 에러 코드 대조

### 3.1 결제 인증 실패 (failUrl 리다이렉트)

| 에러 코드 | 원인 | 현재 처리 | 필요 조치 |
|-----------|------|-----------|-----------|
| `PAY_PROCESS_CANCELED` | 구매자 결제 취소 | PaymentFailPage에서 표시 | OK - orderId 미전달 주의 |
| `PAY_PROCESS_ABORTED` | 결제 실패 | PaymentFailPage에서 표시 | OK |
| `REJECT_CARD_COMPANY` | 카드사 거절 | PaymentFailPage에서 표시 | OK |

### 3.2 결제 승인 실패 (서버 API 호출)

| 에러 코드 | 원인 | 현재 처리 | 필요 조치 |
|-----------|------|-----------|-----------|
| `NOT_FOUND_PAYMENT_SESSION` | 10분 초과/paymentKey 불일치 | generic 에러 전달 | **H1**: 에러 코드 파싱 필요 |
| `REJECT_CARD_COMPANY` | 카드사 거절 | generic 에러 전달 | **H1**: 사용자 메시지 분류 필요 |
| `FORBIDDEN_REQUEST` | API키/주문번호 불일치 | generic 에러 전달 | **H1**: 로그 강화 필요 |
| `UNAUTHORIZED_KEY` | API 키 오류 | generic 에러 전달 | **H1**: 서버 로그에 명확히 기록 |
| `ALREADY_PROCESSED_PAYMENT` | 이미 처리된 결제 | HttpClientErrorException에서 일부 처리 | 추가 검증 필요 |

## 4. 작업 항목

### Phase 1: 백엔드 에러 핸들링 강화

1. **[H1] Toss 에러 응답 파싱 구현**
   - `HttpClientErrorException`에서 response body의 `code`/`message` 추출
   - Toss 에러 코드를 내부 에러 코드로 매핑
   - 사용자에게 전달할 메시지와 내부 로그 메시지 분리

2. **[H3] 주문 총액 검증 추가**
   - `confirmTossPayment()`에서 DB의 order totalAmount와 request amount 비교
   - 불일치 시 결제 거부 및 로깅

3. **[M1] 에러 코드 분리**
   - `ORDER_ALREADY_CANCELLED` 에러 코드 추가
   - `PAYMENT_AMOUNT_MISMATCH`는 금액 불일치에만 사용

4. **[M2] 취소 실패 상태 관리**
   - 취소 실패 시 로그 강화 (Toss 에러 코드 포함)
   - 재시도 가능하도록 상태 유지 전략 문서화

5. **[L1] 결제 상태 전이 로깅**
   - Payment entity의 complete/fail/refund 메서드에 info 로그 추가

### Phase 2: 프론트엔드 에러 핸들링 강화

6. **[H2] 에러 메시지 분류 및 사용자 안내**
   - PaymentSuccessPage에서 백엔드 에러 응답의 code 기반 메시지 분류
   - 사용자 친화적 에러 메시지 매핑 (카드사 거절, 시간 초과, 기타)

7. **[M3] 게스트 결제 검증 강화**
   - sessionStorage의 guest_order가 있어도 서버에 결제 상태 조회 추가
   - 또는 게스트 결제 confirm 로직 정리

8. **[L2] 도달 불가 코드 정리**
   - 게스트 플로우의 clearCart() 위치 정리

### Phase 3: 통합 테스트

9. **결제 승인 정상 플로우 테스트**
   - 로그인 사용자 + 게스트 모두 확인

10. **에러 시나리오 테스트**
    - Toss 테스트 헤더를 활용한 실패 재현
    - 각 에러 코드별 사용자 메시지 확인

## 5. 우선순위 및 의존성

```
[H1] Toss 에러 파싱 ──┐
[H3] 금액 검증       ──┤──→ [H2] FE 에러 메시지 ──→ 통합 테스트
[M1] 에러코드 분리   ──┘
[M2] 취소 상태 관리 ──→ 별도 진행 가능
[L1] 로깅 ──→ 별도 진행 가능
[L2] 코드 정리 ──→ 별도 진행 가능
[M3] 게스트 검증 ──→ 별도 진행 가능
```

## 6. 영향 범위

| 파일 | 변경 사항 |
|------|-----------|
| `PaymentService.java` | Toss 에러 파싱, 금액 검증, 취소 로그 |
| `ErrorCode.java` | ORDER_ALREADY_CANCELLED 추가 |
| `Payment.java` | 상태 전이 로깅 |
| `PaymentSuccessPage.tsx` | 에러 메시지 분류, 게스트 검증 |
| `CheckoutPage.tsx` | 도달 불가 코드 정리 |

## 7. 성공 기준

- [ ] Toss API 에러 응답의 code/message가 백엔드 로그에 정확히 기록됨
- [ ] 결제 승인 금액과 DB 주문 총액이 일치하지 않으면 결제 거부됨
- [ ] 사용자에게 에러 유형별 안내 메시지가 표시됨 (카드사 거절, 시간 초과 등)
- [ ] 결제 상태 전이가 info 레벨로 로깅됨
- [ ] 정상 결제 플로우가 깨지지 않음
