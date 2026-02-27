# Shop Project Changelog

## [2026-02-27] - Toss PG Error Handling Enhancement (v0.0.4)

### Added
- Toss JSON response parsing (code/message extraction from error responses)
- Private utility methods: parseTossError() and toUserMessage()
- ApiError class for type-safe error propagation to frontend
- 5-layer error handling system (parsing → mapping → translation → validation → logging)
- Order total cross-validation to prevent payment amount manipulation
- Separated error codes: ORDER_ALREADY_CANCELLED distinct from PAYMENT_AMOUNT_MISMATCH
- Guest payment amount validation in PaymentSuccessPage
- Info-level logging for all payment state transitions (complete, fail, refund)
- Enhanced exception handling in cancelTossPayment with Toss error code logging

### Changed
- ErrorCode: Added ORDER_ALREADY_CANCELLED for cancelled order cases
- PaymentService: Refactored confirmTossPayment to use structured error parsing instead of string contains()
- PaymentService: Enhanced cancelTossPayment with separate HttpClientErrorException handler
- PaymentSuccessPage: Added errorCode state and ApiError import for error classification
- PaymentSuccessPage: Guest order validation now checks both orderId and amount
- apiClient.ts: parseResponse now throws ApiError(code, message) for downstream handling

### Fixed
- No gaps found - 100% design match rate (14/14 checklist items)

### Technical Details
- Design Match Rate: 100% (14/14 checkpoints)
- Iterations needed: 0 (first implementation achieved 100%)
- Files changed: 6 backend files (3 modified), 4 frontend files (3 modified)
- Error codes: 5 Toss codes mapped to user-friendly messages + default fallback
- Validation layers: Request amount + Order total + Order status checks
- Build Status: BUILD SUCCESSFUL (compileJava + tsc + npm build)
- Error handling coverage: HttpClientErrorException + general Exception + BusinessException

### Security Improvements
- Order total verification prevents payment amount tampering
- Guest payment amount validation prevents sessionStorage spoofing
- Idempotency keys prevent duplicate processing on retry
- Proper error code separation prevents logic errors in conditionals

---

## [2026-02-27] - Payment Edge Cases Enhancement (v0.0.3)

### Added
- 9 edge cases for Toss Payments system stability
- Idempotency-Key header support (orderId-based confirm, cancel_ prefixed cancel)
- Payment FAILED status on confirmation failure (HttpClientErrorException + Exception handling)
- BigDecimal.compareTo() for precise payment amount validation
- Toss payment cancellation during order cancellation (COMPLETED + paymentKey check)
- Race condition prevention (order CANCELLED status check during payment confirm)
- BAD_GATEWAY(502) HTTP status for external PG API failures
- RestTemplate timeout configuration (connect: 5s, read: 30s)
- Guest payment confirm skip via sessionStorage
- Payment button duplicate click prevention with useRef (3-point reset on errors)

### Changed
- ErrorCode: TOSS_PAYMENT_CONFIRM_FAILED/CANCEL_FAILED now return BAD_GATEWAY(502) instead of BAD_REQUEST
- OrderService: Added PaymentService dependency for Toss cancellation
- CheckoutPage: Enhanced guest payment flow with sessionStorage marker
- PaymentSuccessPage: Added guest payment detection for confirm skip

### Fixed
- No gaps found - 100% design match rate (9/9 edge cases)

### Technical Details
- Design Match Rate: 100% (9/9 checkpoints)
- Architecture Compliance: 95%
- Convention Compliance: 92%
- Build Status: BUILD SUCCESSFUL
- Frontend: TypeScript compilation PASS
- Backend: Docker build PASS (no circular dependencies)
- Iterations needed: 0 (first implementation achieved 100%)

---

## [2026-02-26] - Claim Domain Implementation (v0.0.2)

### Added
- Claim domain (cancel/return) with 11 new backend files
- ClaimType enum (CANCEL, RETURN) with distinct workflow support
- ClaimStatus enum (RECEIVED, PROCESSING, PICKUP, PICKED_UP, COMPLETED, REJECTED)
- 4 REST API endpoints for claim management (/api/claims GET/POST/GET{id}/DELETE{id})
- ClaimService with refund, stock restoration, and duplicate prevention logic
- N+1 optimized queries with fetch join and 2-query pagination pattern
- CreateClaimRequest, ClaimResponse, ClaimItemResponse, ClaimSummaryResponse DTOs
- Frontend useClaims() and useClaim() hooks with SWR caching
- CancelReturnPage fully integrated with API (removed mock data)
- ClaimDetailPage with status step visualization and withdraw functionality
- 7 TypeScript type definitions for claim domain (ClaimType, ClaimStatus, ClaimResponse, etc.)

### Changed
- CancelReturnPage: Migrated from mock data to useClaims() API hook
- CancelReturnPage: Removed 교환 (exchange) tab (Phase 1: cancel/return only)
- ClaimDetailPage: Replaced placeholder content with full detail view
- ErrorCode enum: Added CLAIM_NOT_FOUND error code

### Fixed
- (No gaps found - 100% design match rate on first implementation)

### Technical Details
- Design Match Rate: 100% (38/38 checkpoints)
- Build Status: BUILD SUCCESSFUL (compileJava + tsc + npm build)
- Transaction Safety: @Transactional on service methods
- Validation: Jakarta Bean Validation on all DTOs
- Price Safety: Refund amount uses immutable priceAtOrder from OrderItem
- Auth: All endpoints require JWT; detail/delete endpoints verify owner

---

## [2026-02-26] - Shop Feature Completion (v0.0.1)

### Added
- Full REST API integration for 10+ frontend pages
- JWT-based authentication with signup/login forms
- Dual cart system: API-backed for logged-in users, local store for guests
- 7 custom SWR hooks for products, categories, cart, and orders
- 12 type definitions matching all backend DTOs
- Order management: create, list, view details, cancel functionality
- Cart operations: add, update, remove items with real-time sync
- Mobile-responsive navigation with category list integration
- Type-safe adapter functions for API type conversion
- Proper error handling with user-visible messages
- Loading state indicators across all async operations

### Changed
- Migrated product list view from mock data to real API (`useProducts`)
- Updated category navigation to use real API endpoints (`useCategories`)
- Changed route pattern from `/category/:slug` to `/category/:categoryId` for backend ID alignment
- Reimplemented cart system with auth-based branching (API vs local)
- Enhanced LoginPage with email/password signup form (was stub-only)
- Updated cart badge to reflect API cart count for logged-in users
- Refactored product detail page to use `useProduct` hook

### Fixed
- Orders API pagination type mismatch: Added `OrderPage` type definition, modified `useOrders` hook to extract `.content` property
- Cart badge ignoring API cart state for logged-in users: Updated `MobileBottomNav` to use `useCart()` hook
- Missing type definitions for paginated API responses
- Auth guard inconsistency across API endpoints
- Missing CORS headers configuration (verified in backend)

### Security
- Implemented JWT-based stateless authentication
- Auto token injection in all API requests via apiClient
- Protected order and cart endpoints with auth guards
- Proper error handling for unauthorized access (401)
- Password encoding with BCrypt in backend

---

## Metrics Summary

| Metric | Value | Status |
|--------|-------|--------|
| Overall Match Rate | 93% | PASS |
| Pages Integrated | 10/10 | COMPLETE |
| API Endpoints | 14 | OPERATIONAL |
| Type Definitions | 12 | COMPLETE |
| Design Match Improvement | +21pp | FROM 72% TO 93% |
| Critical Issues Fixed | 2 | RESOLVED |
| Runtime Errors | 0 | NONE |

---

## Next Release (v0.1.0)

### Planned Improvements
- Guest-to-API cart merge on login (cart migration)
- React Testing Library tests for all hooks
- Environment variable documentation (.env.example)
- Move Product type from mock/ to types/product.ts
- Replace order cancel reload with SWR mutate
- Integration tests for pages + API flows

### Future Features
- Claims/returns management API
- Social login (Kakao, Naver OAuth)
- Banner management CMS
- Product search and advanced filtering
- Wishlist functionality

---

## Project Links

- **Completion Report**: [shop.report.md](./features/shop.report.md)
- **Gap Analysis**: [shop.analysis.md](../03-analysis/shop.analysis.md)
- **Frontend**: `/Users/junghanso/Documents/shop/fashion-mall`
- **Backend**: `/Users/junghanso/Documents/shop/backend`

