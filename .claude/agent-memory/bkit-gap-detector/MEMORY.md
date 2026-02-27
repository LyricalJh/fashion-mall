# Gap Detector Memory - Shop Project

## Last Analysis: 2026-02-27 (payment-edge-cases)
- Overall Match Rate: 100% (9/9 items PASS)
- Idempotency-Key: confirm + cancel both have headers
- Payment FAILED state: fail() method + dual catch blocks
- BigDecimal compareTo: replaces intValue()
- Order cancel -> Toss cancel: COMPLETED+paymentKey check
- Race condition guard: CANCELLED order check before confirm
- Guest checkout skip: sessionStorage flag pattern
- ErrorCode 502: BAD_GATEWAY for both TOSS errors
- RestTemplate timeout: connect 5s, read 30s
- Double-click prevention: useRef + 3 error-path resets

## Previous Analysis: 2026-02-26 (v3.1 - MyPage Focus)
- Overall Match Rate: 87% (MyPage feature)

## Resolved Issues (v3.1)
- #1: Orders Page vs array -- useOrders now uses OrderPage type + .content extraction
- #3: Mobile cart badge -- MobileBottomNav reads API cart for logged-in users
- #6: Social login partially resolved -- Kakao real, Naver still stub
- #9: Payment double-fire -- resolved in v2.1
- #13: Inquiry API Page type -- useInquiries.ts now uses InquiryPage + .content extraction
- #14: Coupon validFrom -- NOT a real issue; createdAt serves as startDate correctly

## Open Issues (v3.1 MyPage)
- HIGH: CancelReturnPage + ClaimDetailPage entirely Mock data, no backend API
- HIGH: InquiryPage fmtDate() bug -- split('-') fails on ISO LocalDateTime ("2026-02-26T14:30:00" -> NaN)
- MEDIUM: CouponPage/InquiryPage/AddressPage missing error state UI
- MEDIUM: OrderDetailPage cancelOrder uses window.location.reload() instead of SWR mutate
- MEDIUM: useOrders size=50 vs backend default size=10 mismatch
- MEDIUM: Zip code search stub (AddressFormPage)
- LOW: #8 reload on cancel, fmtPrice/fmtDate/toKoreanStatus duplicated across 6 files
- LOW: addressStore.ts has dead code (only formatPhone used)
- LOW: WithdrawPage title text-lg vs text-2xl inconsistency

## Backend Verified Patterns
- ApiResponse<T> with {success, data, error} format
- All controllers return DTOs, never entities
- Fetch Join for N+1 prevention in ProductRepository, OrderRepository (NOT InquiryRepository)
- OrderService uses DB price (not request price) for order items
- JWT: Access 1h, Refresh 7d in JwtUtil constants
- PaymentService.confirmTossPayment: idempotent for COMPLETED status
- AddressService: clearDefaultAddress before setting new default
- CouponService: owner validation before use
- KakaoAuthService: saves address to Address table on first login
- AuthController.withdraw: DELETE /api/auth/withdraw endpoint exists

## Config Concerns
- JWT_SECRET has hardcoded default in application.yml
- sql.init.mode: always (should be embedded/never for prod)
- No .env.example files exist
- No frontend container in docker-compose.yml

## File Paths (macOS)
- Analysis doc: /Users/junghanso/Documents/shop/docs/03-analysis/MyPage.analysis.md
- Frontend src: /Users/junghanso/Documents/shop/fashion-mall/src/
- Backend src: /Users/junghanso/Documents/shop/backend/src/main/java/com/shop/
- MyPage pages: fashion-mall/src/pages/MyPage/ (10 files incl. MyPageLayout, MyPageSidebar)
- Hooks: useOrders.ts, useCoupons.ts, useInquiries.ts, useAddresses.ts
- Backend domains: order/, address/, coupon/, inquiry/, user/
