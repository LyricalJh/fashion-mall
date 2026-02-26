# 토스페이먼츠 결제 취소 연동 가이드 (Version 2)
## 목차
1. [결제 취소 기한 & 소요 시간](#1-결제-취소-기한--소요-시간)
2. [전액 취소하기](#2-전액-취소하기)
3. [부분 취소하기](#3-부분-취소하기)
4. [가상계좌 결제 환불하기](#4-가상계좌-결제-환불하기)
5. [결제위젯 환불 계좌 확인하기](#5-결제위젯-환불-계좌-확인하기)
6. [서버 구현 예시](#6-서버-구현-예시)
7. [에러 코드 정리](#7-에러-코드-정리)
8. [자주 묻는 질문 (FAQ)](#8-자주-묻는-질문-faq)
---
## 1. 결제 취소 기한 & 소요 시간
결제수단마다 취소 기한과 환불 소요 시간이 다릅니다. 구매자에게 적절한 안내가 필요합니다.
| 결제수단 | 취소 기한 | 환불 소요 시간 |
|---|---|---|
| 카드 | 사실상 제한 없음 (1년 초과 시 카드사별로 불가할 수 있음) | 매입 전 즉시 / 매입 후 또는 부분취소: 영업일 3~4일 |
| 계좌이체 | 180일 이내 | 실시간 즉시 |
| 가상계좌 | 보통 365일 (상점 설정에 따라 다를 수 있음) | 영업일 기준 2일 (의심거래 탐지 시 최대 9일) |
| 휴대폰 | 결제 발생 당월에만 취소 가능 | 당일 |
| 해외 간편결제(PayPal) | 180일 이내 | 영업일 최대 5일 (일부 환불은 최대 30일) |
> ✅ **이미 정산받은 결제도 취소 가능합니다.** 다음 정산금에서 상계처리됩니다.
---
## 2. 전액 취소하기
### API 엔드포인트
```
POST https://api.tosspayments.com/v1/payments/{paymentKey}/cancel
```
- `paymentKey`: 결제 승인 시 응답으로 받은 고유 키
- 멱등키(`Idempotency-Key`) 헤더를 추가하면 **중복 취소를 방지**할 수 있습니다.
### 요청 예시 (cURL)
```bash
curl --request POST \\
  --url https://api.tosspayments.com/v1/payments/{paymentKey}/cancel \\
  --header 'Authorization: Basic {BASE64_ENCODED_SECRET_KEY}' \\
  --header 'Content-Type: application/json' \\
  --header 'Idempotency-Key: {UNIQUE_IDEMPOTENCY_KEY}' \\
  --data '{"cancelReason": "구매자가 취소를 원함"}'
```
### 요청 파라미터
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `cancelReason` | string | ✅ | 취소 사유 (최대 200자) |
| `cancelAmount` | integer | ❌ | 취소 금액. **생략 시 전액 취소** |
| `taxFreeAmount` | integer | ❌ | 취소 금액 중 면세 금액 |
| `refundReceiveAccount` | object | ❌ | 가상계좌 환불 시 필수 (아래 참고) |
### 성공 응답
```json
{
  "paymentKey": "RYWLuVnRHlZmNdBYk2EGH",
  "orderId": "aCvothWcKSe6cp_4GjzZ6",
  "orderName": "토스 티셔츠 외 2건",
  "status": "CANCELED",
  "method": "카드",
  "totalAmount": 10000,
  "balanceAmount": 0,
  "cancels": [
    {
      "cancelReason": "구매자가 취소를 원함",
      "canceledAt": "2022-01-01T11:32:04+09:00",
      "cancelAmount": 10000,
      "refundableAmount": 0,
      "transactionKey": "8B4F646A829571D870A3011A4E13D640",
      "cancelStatus": "DONE"
    }
  ]
}
```
- `status: "CANCELED"` → 전액 취소 완료
- `cancels` 배열에서 각 취소 거래 정보 확인
- `transactionKey` → 각 취소 거래의 고유 키 (저장 권장)
---
## 3. 부분 취소하기
### 요청 예시 (cURL)
```bash
curl --request POST \\
  --url https://api.tosspayments.com/v1/payments/{paymentKey}/cancel \\
  --header 'Authorization: Basic {BASE64_ENCODED_SECRET_KEY}' \\
  --header 'Content-Type: application/json' \\
  --data '{"cancelReason": "일부 상품 반품", "cancelAmount": 10000}'
```
### 부분 취소 응답 (여러 번 취소 시)
부분 취소를 여러 번 실행하면 `cancels` 배열에 취소 내역이 누적됩니다.
```json
{
  "status": "PARTIAL_CANCELED",
  "cancels": [
    {
      "cancelAmount": 10000,
      "cancelReason": "일부 상품 반품",
      "refundableAmount": 40000,
      "canceledAt": "2022-01-01T23:23:52+09:00",
      "transactionKey": "8B4F646A829571D870A3011A4E13D640",
      "cancelStatus": "DONE"
    },
    {
      "cancelAmount": 10000,
      "cancelReason": "추가 상품 반품",
      "refundableAmount": 30000,
      "canceledAt": "2022-01-02T20:00:00+09:00",
      "transactionKey": "6673C15BF350C3F9BF45CEFC48C7A24E",
      "cancelStatus": "DO