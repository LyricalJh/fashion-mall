# Claim Analysis Report

> **Analysis Type**: Gap Analysis (Design vs Implementation)
>
> **Project**: fashion-mall (shop)
> **Analyst**: gap-detector
> **Date**: 2026-02-26
> **Design Doc**: [Claim.design.md](../02-design/features/Claim.design.md)

---

## 1. Analysis Overview

### 1.1 Analysis Purpose

Verify the Claim domain (cancel/return) implementation against the design specification.
The Claim feature was deferred from the MyPage PDCA iteration 1 and is now implemented as a standalone domain.

### 1.2 Analysis Scope

- **Design Document**: `docs/02-design/features/Claim.design.md`
- **Backend Implementation**: `backend/src/main/java/com/shop/domain/claim/`
- **Frontend Implementation**: `fashion-mall/src/` (types, hooks, pages)
- **Analysis Date**: 2026-02-26

---

## 2. Gap Analysis (Design vs Implementation)

### 2.1 Entity Fields -- Claim

| Design Field | Design Type | Implementation | Status | Notes |
|:-------------|:------------|:---------------|:------:|:------|
| id | Long (PK) | `Long id` @Id @GeneratedValue | MATCH | |
| order | Order (M:1) | `Order order` @ManyToOne LAZY | MATCH | |
| user | User (M:1) | `User user` @ManyToOne LAZY | MATCH | |
| claimType | ClaimType | `ClaimType claimType` @Enumerated STRING | MATCH | |
| status | ClaimStatus | `ClaimStatus status` default RECEIVED | MATCH | |
| reason | String @NotBlank | `String reason` @Column(nullable=false) | MATCH | Validation in DTO instead of entity |
| note | String (nullable) | `String note` | MATCH | |
| refundAmount | BigDecimal | `BigDecimal refundAmount` precision(14,2) | MATCH | |
| refundMethod | String | `String refundMethod` | MATCH | |
| bankName | String (nullable) | `String bankName` | MATCH | |
| accountNumber | String (nullable) | `String accountNumber` | MATCH | |
| completedAt | LocalDateTime (nullable) | `LocalDateTime completedAt` | MATCH | |
| items | List\<ClaimItem\> (1:N, cascade ALL) | `List<ClaimItem> items` cascade ALL, orphanRemoval | MATCH | |
| (extends BaseEntity) | createdAt, updatedAt | `extends BaseEntity` | MATCH | |

**Result: 13/13 fields -- 100% match**

### 2.2 Entity Fields -- ClaimItem

| Design Field | Design Type | Implementation | Status | Notes |
|:-------------|:------------|:---------------|:------:|:------|
| id | Long (PK) | `Long id` @Id @GeneratedValue | MATCH | |
| claim | Claim (M:1) | `Claim claim` @ManyToOne LAZY | MATCH | |
| orderItem | OrderItem (M:1) | `OrderItem orderItem` @ManyToOne LAZY | MATCH | |
| quantity | int | `int quantity` @Column(nullable=false) | MATCH | |
| productName | String (snapshot) | `String productName` @Column(nullable=false) | MATCH | |

**Result: 5/5 fields -- 100% match**

### 2.3 Enums

| Design Enum | Design Values | Implementation | Status |
|:------------|:--------------|:---------------|:------:|
| ClaimType | CANCEL, RETURN | `CANCEL, RETURN` | MATCH |
| ClaimStatus | RECEIVED, PROCESSING, PICKUP, PICKED_UP, COMPLETED, REJECTED | All 6 values present | MATCH |

**Result: 2/2 enums -- 100% match**

### 2.4 API Endpoints

| Design Endpoint | Method | Implementation | Status | Notes |
|:----------------|:-------|:---------------|:------:|:------|
| `/api/claims` | POST | `@PostMapping` in ClaimController | MATCH | Returns 201 CREATED |
| `/api/claims` | GET | `@GetMapping` with Pageable | MATCH | Default size=10, sort=createdAt DESC |
| `/api/claims/{id}` | GET | `@GetMapping("/{id}")` | MATCH | Owner verification included |
| `/api/claims/{id}` | DELETE | `@DeleteMapping("/{id}")` | MATCH | Returns 204 NO_CONTENT |

**Result: 4/4 endpoints -- 100% match**

### 2.5 Business Rules

| # | Design Rule | Implementation | Status | Notes |
|:-:|:------------|:---------------|:------:|:------|
| 1 | Cancel: order.status = CONFIRMED or PAID | `validateOrderStatusForClaim()` checks CONFIRMED and PAID | MATCH | |
| 2 | Return: order.status = DELIVERED | `validateOrderStatusForClaim()` checks DELIVERED | MATCH | |
| 3 | Refund = SUM(priceAtOrder * quantity) | Loop calculates `orderItem.getPriceAtOrder().multiply(quantity)` | MATCH | |
| 4 | Completion: Payment.refund() | `completeClaim()` calls `payment.refund()` | MATCH | Payment.refund() sets REFUNDED status + refundAmount + refundDate |
| 5 | Completion: Product.increaseStock() | `completeClaim()` iterates items, calls `product.increaseStock(qty)` | MATCH | |
| 6 | Duplicate prevention: check claimed quantity | `sumClaimedQuantityByOrderItemId()` repository query, validates available qty | MATCH | Excludes REJECTED claims |
| 7 | Cancel auto-completes (pre-shipment) | `if (claimType == CANCEL) completeClaim(claim, payment)` | MATCH | |
| 8 | Return stays RECEIVED (post-shipment) | Return path does not call completeClaim; stays RECEIVED | MATCH | |
| 9 | Withdraw only for RECEIVED status | `Claim.withdraw()` throws if status != RECEIVED | MATCH | |
| 10 | Cancel also sets Order to CANCELLED | `completeClaim()` calls `claim.getOrder().cancel()` | MATCH | Order.cancel() sets CANCELLED |

**Result: 10/10 rules -- 100% match**

### 2.6 Request/Response DTOs

#### CreateClaimRequest

| Design Field | Implementation | Validation | Status |
|:-------------|:---------------|:-----------|:------:|
| orderId | `Long orderId` | @NotNull | MATCH |
| claimType | `ClaimType claimType` | @NotNull | MATCH |
| reason | `String reason` | @NotBlank | MATCH |
| bankName | `String bankName` | optional | MATCH |
| accountNumber | `String accountNumber` | optional | MATCH |
| items[] | `List<ClaimItemRequest> items` | @NotEmpty, @Valid | MATCH |
| items[].orderItemId | `Long orderItemId` | @NotNull | MATCH |
| items[].quantity | `int quantity` | @Min(1) | MATCH |

#### ClaimResponse (detail)

| Field | Implementation | Status |
|:------|:---------------|:------:|
| id, orderId, orderNumber | Present | MATCH |
| claimType, status | String (enum .name()) | MATCH |
| reason, note | Present | MATCH |
| refundAmount, refundMethod | Present | MATCH |
| bankName, accountNumber | Present | MATCH |
| completedAt, createdAt | Present | MATCH |
| items[] | List\<ClaimItemResponse\> via `.from()` | MATCH |

#### ClaimItemResponse

| Field | Implementation | Status |
|:------|:---------------|:------:|
| id, orderItemId, productId | Present | MATCH |
| productName, quantity | Present | MATCH |
| priceAtOrder, subtotal | Calculated (price * qty) | MATCH |
| imageUrl | From product.thumbnailUrl | MATCH |

#### ClaimSummaryResponse (list)

| Field | Implementation | Status |
|:------|:---------------|:------:|
| id, orderId, orderNumber | Present | MATCH |
| claimType, status, reason | Present | MATCH |
| refundAmount, createdAt | Present | MATCH |
| itemCount | `claim.getItems().size()` | MATCH |
| firstProductName, firstProductImageUrl | First item data | MATCH |
| firstItemQuantity, firstItemPrice | First item data | MATCH |

**Result: All DTO fields match design expectations**

### 2.7 N+1 Prevention

| Query | Purpose | Fetch Join | Status |
|:------|:--------|:-----------|:------:|
| `findByIdWithItems` | Detail view | JOIN FETCH items + orderItem + product | MATCH |
| `findAllWithItemsByIdIn` | List view (2-query pattern) | JOIN FETCH items + orderItem + product | MATCH |
| `findByUserIdOrderByCreatedAtDesc` | Page query (IDs only) | No join (intentional - pagination) | MATCH |
| `sumClaimedQuantityByOrderItemId` | Duplicate check | Aggregate query (no N+1 risk) | MATCH |

**Result: 4/4 queries properly optimized**

### 2.8 Error Code

| Design Requirement | Implementation | Status |
|:-------------------|:---------------|:------:|
| CLAIM_NOT_FOUND added to ErrorCode | `CLAIM_NOT_FOUND(HttpStatus.NOT_FOUND, "CLAIM_NOT_FOUND", ...)` at line 59 | MATCH |

### 2.9 Frontend Types (api.ts)

| Design Type | Implementation | Matches Backend DTO | Status |
|:------------|:---------------|:--------------------|:------:|
| ClaimType | `'CANCEL' \| 'RETURN'` | Yes | MATCH |
| ClaimStatus | 6 status values | Yes | MATCH |
| ClaimItemResponse | 8 fields | Matches ClaimItemResponse.java | MATCH |
| ClaimResponse | 13 fields | Matches ClaimResponse.java | MATCH |
| ClaimSummaryResponse | 12 fields | Matches ClaimSummaryResponse.java | MATCH |
| ClaimPage | Standard page wrapper | Matches Spring Page | MATCH |
| CreateClaimRequest | 6 fields (+ nested items) | Matches CreateClaimRequest.java | MATCH |

**Result: 7/7 frontend types -- 100% match**

### 2.10 Frontend Hooks (useClaims.ts)

| Design Requirement | Implementation | Status |
|:-------------------|:---------------|:------:|
| useClaims(page, size) -- list hook | SWR-based, returns ClaimSummaryResponse[] | MATCH |
| useClaim(id) -- detail hook | SWR-based, returns ClaimResponse | MATCH |
| createClaim(request) -- POST | `apiPost('/claims', request)` | MATCH |
| withdrawClaim(id) -- DELETE | `apiDelete('/claims/${id}')` | MATCH |
| Auth-gated (isLoggedIn check) | Both hooks check `isLoggedIn` before fetching | MATCH |

**Result: 5/5 hooks -- 100% match**

### 2.11 Frontend Pages

#### CancelReturnPage.tsx (Mock -> API)

| Requirement | Implementation | Status |
|:------------|:---------------|:------:|
| Uses `useClaims()` hook (no mock data) | `const { claims, isLoading, error } = useClaims()` | MATCH |
| Loading state | Spinner with "loading..." message | MATCH |
| Error state | Red error boundary displayed | MATCH |
| Empty state | Dashed border with empty message | MATCH |
| Claim card with product info | ClaimCard component with image, name, price | MATCH |
| Status labels (type-aware) | `getClaimStatusLabel()` differentiates CANCEL/RETURN | MATCH |
| Navigation to detail page | `navigate('/mypage/returns/${claim.id}')` | MATCH |
| Exchange tab removed (Phase 1 = cancel/return only) | No exchange tab present | MATCH |

#### ClaimDetailPage.tsx (Placeholder -> Real)

| Requirement | Implementation | Status |
|:------------|:---------------|:------:|
| Uses `useClaim(id)` hook (no placeholder) | `const { claim, isLoading, error } = useClaim(id)` | MATCH |
| Status step visualization | `StatusSteps` component with CANCEL/RETURN flows | MATCH |
| Order info section | orderNumber, claimType, reason, note displayed | MATCH |
| Claim items list | Iterates `claim.items` with image, name, qty, price | MATCH |
| Refund info section | refundAmount, refundMethod, bankName, completedAt | MATCH |
| Withdraw button (RECEIVED only) | `{claim.status === 'RECEIVED' && <button>}` | MATCH |
| Withdraw calls API | `withdrawClaim(claim.id)` then navigates back | MATCH |
| Back navigation | Link to `/mypage/returns` | MATCH |

**Result: 16/16 frontend page requirements -- 100% match**

### 2.12 File List Verification

#### Backend (Design: 11 new files)

| # | Design File | Exists | Status |
|:-:|:------------|:------:|:------:|
| 1 | `domain/claim/entity/Claim.java` | Yes | MATCH |
| 2 | `domain/claim/entity/ClaimItem.java` | Yes | MATCH |
| 3 | `domain/claim/entity/ClaimType.java` | Yes | MATCH |
| 4 | `domain/claim/entity/ClaimStatus.java` | Yes | MATCH |
| 5 | `domain/claim/repository/ClaimRepository.java` | Yes | MATCH |
| 6 | `domain/claim/dto/CreateClaimRequest.java` | Yes | MATCH |
| 7 | `domain/claim/dto/ClaimResponse.java` | Yes | MATCH |
| 8 | `domain/claim/dto/ClaimItemResponse.java` | Yes | MATCH |
| 9 | `domain/claim/dto/ClaimSummaryResponse.java` | Yes | MATCH |
| 10 | `domain/claim/service/ClaimService.java` | Yes | MATCH |
| 11 | `domain/claim/controller/ClaimController.java` | Yes | MATCH |

#### Backend (Design: 1 modified file)

| # | Design File | Modified | Status |
|:-:|:------------|:--------:|:------:|
| 12 | `global/exception/ErrorCode.java` | CLAIM_NOT_FOUND added | MATCH |

#### Frontend (Design: 4 modified files)

| # | Design File | Modified | Status |
|:-:|:------------|:--------:|:------:|
| 13 | `src/types/api.ts` | Claim types added (lines 207-271) | MATCH |
| 14 | `src/hooks/useClaims.ts` | New file created | MATCH |
| 15 | `src/pages/MyPage/CancelReturnPage.tsx` | Rewritten from mock to API | MATCH |
| 16 | `src/pages/MyPage/ClaimDetailPage.tsx` | Rewritten from placeholder to real detail | MATCH |

**Result: 16/16 files -- 100% match**

---

## 3. Detailed Checkpoint Summary

### 3.1 All Checkpoints

| # | Category | Checkpoint | Status |
|:-:|:---------|:-----------|:------:|
| 1 | Entity | Claim entity -- 13 fields match design | MATCH |
| 2 | Entity | ClaimItem entity -- 5 fields match design | MATCH |
| 3 | Enum | ClaimType: CANCEL, RETURN | MATCH |
| 4 | Enum | ClaimStatus: 6 statuses | MATCH |
| 5 | API | POST /api/claims | MATCH |
| 6 | API | GET /api/claims (paginated) | MATCH |
| 7 | API | GET /api/claims/{id} | MATCH |
| 8 | API | DELETE /api/claims/{id} (withdraw) | MATCH |
| 9 | Rule | Cancel only for CONFIRMED/PAID orders | MATCH |
| 10 | Rule | Return only for DELIVERED orders | MATCH |
| 11 | Rule | Refund = SUM(priceAtOrder * quantity) | MATCH |
| 12 | Rule | Completion: Payment.refund() called | MATCH |
| 13 | Rule | Completion: Product.increaseStock() called | MATCH |
| 14 | Rule | Duplicate prevention: claimed qty check | MATCH |
| 15 | Rule | Cancel auto-completes | MATCH |
| 16 | Rule | Return stays RECEIVED | MATCH |
| 17 | Rule | Withdraw only RECEIVED status | MATCH |
| 18 | Rule | Cancel sets Order to CANCELLED | MATCH |
| 19 | N+1 | findByIdWithItems fetch join | MATCH |
| 20 | N+1 | findAllWithItemsByIdIn fetch join | MATCH |
| 21 | N+1 | 2-query pattern for paginated list | MATCH |
| 22 | ErrorCode | CLAIM_NOT_FOUND in ErrorCode.java | MATCH |
| 23 | DTO | CreateClaimRequest with validation | MATCH |
| 24 | DTO | ClaimResponse with static from() | MATCH |
| 25 | DTO | ClaimItemResponse with calculated subtotal | MATCH |
| 26 | DTO | ClaimSummaryResponse with first item data | MATCH |
| 27 | Frontend | Claim types in api.ts match backend | MATCH |
| 28 | Frontend | useClaims hook (list) | MATCH |
| 29 | Frontend | useClaim hook (detail) | MATCH |
| 30 | Frontend | createClaim function | MATCH |
| 31 | Frontend | withdrawClaim function | MATCH |
| 32 | Frontend | CancelReturnPage uses API (no mock) | MATCH |
| 33 | Frontend | CancelReturnPage: loading/error/empty states | MATCH |
| 34 | Frontend | CancelReturnPage: exchange tab removed | MATCH |
| 35 | Frontend | ClaimDetailPage uses API (no placeholder) | MATCH |
| 36 | Frontend | ClaimDetailPage: status step visualization | MATCH |
| 37 | Frontend | ClaimDetailPage: withdraw button (RECEIVED only) | MATCH |
| 38 | File | All 16 design files present | MATCH |

### 3.2 Minor Observations (Not Gaps)

These items are implementation enhancements beyond the design -- not deductions:

| # | Observation | Severity | Notes |
|:-:|:------------|:---------|:------|
| 1 | ClaimSummaryResponse includes `firstProductImageUrl`, `firstItemQuantity`, `firstItemPrice` for richer list UX | INFO | Good addition for mobile card layout |
| 2 | ClaimItemResponse includes `imageUrl` from product.thumbnailUrl | INFO | Good for product display |
| 3 | CancelReturnPage has "pickup inquiry" button for returns | INFO | Stub (alert) -- fine for Phase 1 |
| 4 | ClaimDetailPage has status step progress visualization | INFO | Excellent UX beyond design spec |
| 5 | Swagger annotations on all controller methods | INFO | Good documentation practice |
| 6 | `@Transactional(readOnly = true)` on read methods | INFO | Performance optimization |

---

## 4. Match Rate Calculation

```
Total Checkpoints:  38
Matched:            38
Gaps (missing):      0
Gaps (changed):      0
Gaps (added):        0

Match Rate = 38 / 38 = 100%
```

---

## 5. Overall Scores

| Category | Score | Status |
|:---------|:-----:|:------:|
| Entity/Data Model Match | 100% | PASS |
| Enum Match | 100% | PASS |
| API Endpoint Match | 100% | PASS |
| Business Rules Match | 100% | PASS |
| N+1 Prevention | 100% | PASS |
| DTO Match | 100% | PASS |
| Frontend Types Match | 100% | PASS |
| Frontend Hooks Match | 100% | PASS |
| Frontend Pages Match | 100% | PASS |
| File List Match | 100% | PASS |
| **Overall Match Rate** | **100%** | **PASS** |

---

## 6. Architecture Compliance

| Check | Result |
|:------|:-------|
| Entity uses BaseEntity (createdAt/updatedAt) | PASS |
| DTOs only returned (no entity exposure) | PASS -- all methods return Response DTOs |
| Service layer handles transactions | PASS -- @Transactional on ClaimService |
| Repository uses fetch join for N+1 | PASS -- 2 fetch join queries |
| Validation via Jakarta Bean Validation | PASS -- @NotNull, @NotBlank, @Min, @NotEmpty, @Valid |
| Price tampering prevention (DB values used) | PASS -- refundAmount calculated from DB priceAtOrder |
| Frontend: hooks layer between pages and API | PASS -- useClaims/useClaim hooks |
| Frontend: types match backend DTOs | PASS |

---

## 7. Recommendations

### 7.1 No Immediate Actions Required

The implementation matches the design specification at 100%. All 38 checkpoints pass.

### 7.2 Future Improvements (Low Priority, for later phases)

| # | Item | Priority | Notes |
|:-:|:-----|:---------|:------|
| 1 | Partial refund support | LOW | Current design is full-order cancel. Partial cancel (some items) changes order status logic. |
| 2 | Admin claim management endpoints | LOW | Phase 2 scope -- admin can approve/reject/update status |
| 3 | Return pickup scheduling integration | LOW | PICKUP/PICKED_UP status transitions need admin/logistics triggers |
| 4 | Refund amount validation against payment amount | LOW | Edge case: refundAmount should not exceed payment.paymentAmount |
| 5 | CancelReturnPage pagination UI | LOW | Currently loads first page only; add page navigation for heavy users |

---

## 8. Conclusion

The Claim domain implementation is a precise match to the design document. All 16 files were created/modified as specified. All 10 business rules are correctly implemented. The 4 API endpoints match the design. Frontend types, hooks, and pages are fully integrated with the backend API and no mock data remains.

**Match Rate: 100% -- Design and implementation are fully synchronized.**

---

## Version History

| Version | Date | Changes | Author |
|:--------|:-----|:--------|:-------|
| 1.0 | 2026-02-26 | Initial analysis | gap-detector |
