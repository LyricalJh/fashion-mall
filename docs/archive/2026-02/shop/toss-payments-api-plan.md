# 토스페이먼츠 통합 결제창 연동 가이드 (Version 2)
## 목차
1. [API 키 준비하기](#1-api-키-준비하기)
2. [결제창 띄우기](#2-결제창-띄우기)
3. [리다이렉트 URL 처리하기](#3-리다이렉트-url-처리하기)
4. [결제 승인하기](#4-결제-승인하기)
5. [응답 확인하기](#5-응답-확인하기)
6. [에러 코드 정리](#6-에러-코드-정리)
---
## 1. API 키 준비하기
[토스페이먼츠 개발자센터](https://developers.tosspayments.com) > **API 키** 메뉴에서 **API 개별 연동 키**를 확인합니다.
- 계약 전에도 회원가입하면 **테스트 상점 키**를 발급받아 테스트할 수 있습니다.
- 계약 완료 후에는 **일반결제** MID를 선택하여 **클라이언트 키**와 **시크릿 키**를 확인하세요.
```js
// 테스트 키 예시
const clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
const secretKey = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R";
```
> ⚠️ **시크릿 키는 절대 클라이언트(브라우저), GitHub 등 외부에 노출하지 마세요.**
---
## 2. 결제창 띄우기
### SDK 설치
HTML `<head>`에 스크립트 태그를 추가합니다.
```html
<script src="https://js.tosspayments.com/v2/standard"></script>
```
또는 패키지 매니저로 설치할 수 있습니다.
```bash
npm install @tosspayments/tosspayments-sdk
```
---
### 주문서 페이지 예시 (전체 코드)
```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <script src="https://js.tosspayments.com/v2/standard"></script>
  </head>
  <body>
    <button onclick="requestPayment()">결제하기</button>
    <script>
      // ✅ SDK 초기화
      const clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
      const customerKey = "YOUR_CUSTOMER_KEY"; // 회원 고유 키 (UUID 권장)
      const tossPayments = TossPayments(clientKey);
      // 회원 결제
      const payment = tossPayments.payment({ customerKey });
      // 비회원 결제 시 아래 코드 사용
      // const payment = tossPayments.payment({ customerKey: TossPayments.ANONYMOUS });
      // ✅ 결제 요청 함수
      async function requestPayment() {
        // 결제 요청 전에 orderId, amount를 서버에 저장하여 위변조를 방지하세요.
        await payment.requestPayment({
          method: "CARD",              // 결제수단: CARD (카드/간편결제 통합)
          amount: {
            currency: "KRW",
            value: 50000,              // 결제 금액
          },
          orderId: "UNIQUE_ORDER_ID",  // 고유 주문번호 (중복 불가)
          orderName: "상품명 외 N건",
          successUrl: window.location.origin + "/payment/success",
          failUrl: window.location.origin + "/payment/fail",
          customerEmail: "customer@example.com",
          customerName: "홍길동",
          customerMobilePhone: "01012345678",
          // 카드 결제 옵션
          card: {
            useEscrow: false,
            flowMode: "DEFAULT",       // 통합결제창 모드
            useCardPoint: false,
            useAppCardOnly: false,
          },
        });
      }
    </script>
  </body>
</html>
```
> ⚠️ **모바일 환경에서는 `iframe` 또는 `frame` 위에서 결제창을 호출하지 마세요.**  
> 특정 결제수단(네이버페이 등)이 정상 작동하지 않을 수 있습니다.
---
## 3. 리다이렉트 URL 처리하기
결제창에서 인증이 완료되면 지정한 URL로 리다이렉트됩니다.
### ✅ 결제 인증 성공 (`successUrl`)
```
/payment/success?orderId={ORDER_ID}&paymentKey={PAYMENT_KEY}&amount={AMOUNT}
```
**반드시 확인해야 할 사항:**
- 쿼리 파라미터의 `amount` 값과 결제 요청 시의 `amount` 값이 **동일한지 검증**하세요.
- 값이 다르면 즉시 결제를 취소하고 구매자에게 안내하세요.
- `paymentKey`, `orderId`, `amount`를 서버에 저장하세요.
```js
// 성공 페이지 처리 예시 (프론트엔드)
const urlParams = new URLSearchParams(window.location.search);
const paymentKey = urlParams.get("paymentKey");
const orderId = urlParams.get("orderId");
const amount = Number(urlParams.get("amount"));
// 서버로 결제 승인 요청 전송
await fetch("/payment/confirm", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ paymentKey, orderId, amount }),
});
```
### ❌ 결제 인증 실패 (`failUrl`)
```
/payment/fail?code={ERROR_CODE}&message={ERROR_MESSAGE}&orderId={ORDER_ID}
```
에러 코드와 메시지를 확인해 구매자에게 적절한 안내를 제공하세요.
---
## 4. 결제 승인하기
### 시크릿 키 인코딩
시크릿 키 뒤에 `:` (콜론)을 붙여 Base64로 인코딩합니다.
```bash
# 터미널에서 실행
echo -n 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R:' | base64
```
인코딩 결과를 `Authorization` 헤더에 사용합니다.
```
Authorization: Basic {BASE64_ENCODED_SECRET_KEY}
```
### 결제 승인 API 호출
**엔드포인트:** `POST https://api.tosspayments.com/v1/payments/confirm`
```bash
# cURL 예시
curl --request POST \\
  --url https://api.tosspayments.com/v1/payments/confirm \\
  --header 'Authorization: Basic dGVzdF9za196WExrS0V5cE5BcldtbzUwblgzbG1lYXhZRzVSOg==' \\
  --header 'Content-Type: application/json' \\
  --data '{
    "paymentKey": "{PAYMENT_KEY}",
    "orderId": "{ORDER_ID}",
    "amount": 50000
  }'
```
### Node.js 서버 예시
```js
app.post("/payment/confirm", async (req, res) => {
  const { paymentKey, orderId, amount } = req.body;
  // ✅ DB에 저장된 amount와 비교하여 위변조 검증
  const savedAmount = await db.getOrderAmount(orderId);
  if (savedAmount !== amount) {
    return res.status(400).json({ error: "결제 금액 불일치" });
  }
  const secretKey = process.env.TOSS_SECRET_KEY;
  const encodedKey = Buffer.from(secretKey + ":").toString("base64");
  const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodedKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  const data = await response.json();
  if (!response.ok) {
    return res.status(response.status).json(data);
  }
  // ✅ 결제 완료 처리 (DB 업데이트 등)
  await db.updateOrderStatus(orderId, "PAID", paymentKey);
  res.json(data);
});
```
> ⚠️ **결제 요청 후 10분 이내에 승인 API를 호출해야 합니다.** 초과 시 결제 데이터가 만료됩니다.
---
## 5. 응답 확인하기
### ✅ 성공 응답 (HTTP 200)
```json
{
  "mId": "tosspayments",
  "version": "2024-06-01",
  "paymentKey": "TGDchw1e6yXiWyqhhyQyQ",
  "status": "DONE",
  "orderId": "Z80Mwsd5NlsrgagvCQJEa",
  "orderName": "토스 티셔츠 외 2건",
  "requestedAt": "2022-06-08T15:40:09+09:00",
  "approvedAt": "2022-06-08T15:40:49+09:00",
  "method": "카드",
  "totalAmount": 50000,
  "currency": "KRW",
  "card": {
    "number": "12345678****789*",
    "cardType": "신용",
    "ownerType": "개인",
    "installmentPlanMonths": 0,
    "isInterestFree": false,
    "approveNo": "00000000"
  },
  "receipt": {
    "url": "https://dashboard.tosspayments.com/sales-slip?..."
  }
}
```
- `status: "DONE"` → 결제 완료
- `card` 필드에서 카드 정보 확인
- 간편결제 시 `easyPay` 필드 확인
### ❌ 실패 응답 (HTTP 4XX / 5XX)
```json
{
  "code": "NOT_FOUND_PAYMENT_SESSION",
  "message": "결제 시간이 만료되어 결제 진행 데이터가 존재하지 않습니다."
}
```
---
## 6. 에러 코드 정리
| 에러 코드 | 발생 시점 | 원인 및 해결 방법 |
|---|---|---|
| `PAY_PROCESS_CANCELED` | 인증 실패 | 구매자가 결제를 직접 취소. `orderId`가 전달되지 않을 수 있음 |
| `PAY_PROCESS_ABORTED` | 인증 실패 | 결제 프로세스 중단. 에러 메시지 확인 후 고객센터 문의 |
| `REJECT_CARD_COMPANY` | 인증/승인 실패 | 카드 정보 오류, 한도 초과, 포인트 부족 등. 구매자에게 안내 |
| `NOT_FOUND_PAYMENT_SESSION` | 승인 실패 | 10분 초과 또는 잘못된 `paymentKey`. 키 값 및 시간 확인 |
| `FORBIDDEN_REQUEST` | 승인 실패 | 클라이언트 키/시크릿 키 불일치 또는 `orderId` 변조 |
| `UNAUTHORIZED_KEY` | 승인 실패 | 잘못된 API 키 또는 잘못된 Base64 인코딩 |
---
## 참고 링크
- [토스페이먼츠 공식 문서 (V2)](https://docs.tosspayments.com/guides/v2/payment-window/integration)
- [JavaScript SDK 레퍼런스](https://docs.tosspayments.com/sdk/v2/js)
- [에러 코드 전체 목록](https://docs.tosspayments.com/reference/error-codes)
- [결제 취소하기](https://docs.tosspayments.com/guides/v2/payment-window/cancel)
- [웹훅 연결하기](https://docs.tosspayments.com/guides/webhook)