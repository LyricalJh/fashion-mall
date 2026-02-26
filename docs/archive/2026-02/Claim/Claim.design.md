# Claim 도메인 설계 — 취소/반품 (1차)

## Context

CancelReturnPage, ClaimDetailPage가 Mock 데이터만 사용 중이며 백엔드 Claim API가 없음.
1차에서는 취소/반품만 구현하고 교환은 제외한다.

## 엔티티 설계

### Claim (마스터)

```
Claim extends BaseEntity
├── id: Long (PK)
├── order: Order (M:1)
├── user: User (M:1)
├── claimType: ClaimType (CANCEL, RETURN)
├── status: ClaimStatus
├── reason: String — 사유 (@NotBlank)
├── note: String — 관리자 메모 (nullable)
├── refundAmount: BigDecimal — 환불 금액
├── refundMethod: String — 원 결제수단
├── bankName: String — 무통장 환불 은행 (nullable)
├── accountNumber: String — 무통장 환불 계좌 (nullable)
├── completedAt: LocalDateTime — 완료일 (nullable)
└── items: List<ClaimItem> (1:N, cascade ALL)
```

### ClaimItem (상세)

```
ClaimItem
├── id: Long (PK)
├── claim: Claim (M:1)
├── orderItem: OrderItem (M:1)
├── quantity: int — 클레임 수량 (부분 반품 지원)
└── productName: String — 스냅샷
```

### ClaimType (Enum)

```java
CANCEL,  // 취소 (배송 전: PAID/CONFIRMED 상태)
RETURN   // 반품 (배송 후: DELIVERED 상태)
```

### ClaimStatus (Enum)

```java
RECEIVED,    // 접수
PROCESSING,  // 처리중
PICKUP,      // 회수중 (반품만 해당)
PICKED_UP,   // 회수완료 (반품만 해당)
COMPLETED,   // 완료 (환불 처리됨)
REJECTED     // 불가
```

### 클레임 타입별 상태 흐름

```
취소: RECEIVED → PROCESSING → COMPLETED (or REJECTED)
반품: RECEIVED → PROCESSING → PICKUP → PICKED_UP → COMPLETED (or REJECTED)
```

### 비즈니스 규칙

| 규칙 | 설명 |
|:-----|:-----|
| 취소 가능 조건 | `order.status`가 CONFIRMED 또는 PAID |
| 반품 가능 조건 | `order.status`가 DELIVERED |
| 환불 금액 계산 | `SUM(claimItem.orderItem.priceAtOrder * claimItem.quantity)` |
| 완료 시 처리 | `Payment.refund()` 호출 + 재고 복원 (`Product.increaseStock`) |
| 중복 방지 | 같은 OrderItem에 대해 이미 처리된 수량 체크 |

## API 엔드포인트

```
POST   /api/claims          — 클레임 접수 (취소/반품)
GET    /api/claims          — 내 클레임 목록 (paginated)
GET    /api/claims/{id}     — 클레임 상세
DELETE /api/claims/{id}     — 클레임 철회 (RECEIVED 상태만)
```

## 구현 파일 목록

### Backend (신규 11개)

| 파일 | 설명 |
|:-----|:-----|
| `domain/claim/entity/Claim.java` | Claim 엔티티 |
| `domain/claim/entity/ClaimItem.java` | ClaimItem 엔티티 |
| `domain/claim/entity/ClaimType.java` | Enum (CANCEL, RETURN) |
| `domain/claim/entity/ClaimStatus.java` | Enum (6개 상태) |
| `domain/claim/repository/ClaimRepository.java` | JPA Repository |
| `domain/claim/dto/CreateClaimRequest.java` | 접수 요청 DTO |
| `domain/claim/dto/ClaimResponse.java` | 상세 응답 DTO |
| `domain/claim/dto/ClaimItemResponse.java` | 아이템 응답 DTO |
| `domain/claim/dto/ClaimSummaryResponse.java` | 목록용 요약 DTO |
| `domain/claim/service/ClaimService.java` | 비즈니스 로직 |
| `domain/claim/controller/ClaimController.java` | REST API |

### Backend (수정 1개)

| 파일 | 설명 |
|:-----|:-----|
| `global/exception/ErrorCode.java` | CLAIM_NOT_FOUND 추가 |

### Frontend (수정 4개)

| 파일 | 설명 |
|:-----|:-----|
| `src/types/api.ts` | Claim 관련 타입 추가 |
| `src/hooks/useClaims.ts` | 클레임 API 훅 (신규) |
| `src/pages/MyPage/CancelReturnPage.tsx` | Mock → API 연동, 교환 탭 제거 |
| `src/pages/MyPage/ClaimDetailPage.tsx` | "준비 중" → 실제 상세 페이지 |
