# Gap Detector Memory - Shop Project

## Last Analysis: 2026-02-26 (v3.0)
- Overall Match Rate: 95% (+2pp from v2.1)
- Backend: 100% (30 APIs across 12 domains)
- Frontend hooks: 100% (11/11)
- Frontend page integration: 100% (15/15 scoped)
- New domains: Coupon (92%), Inquiry (85%), Address (97%)
- 3 issues resolved (#1 Orders Page, #3 cart badge, #6 Kakao login)

## Resolved Issues (v3.0)
- #1: Orders Page vs array -- useOrders now uses OrderPage type + .content extraction
- #3: Mobile cart badge -- MobileBottomNav reads API cart for logged-in users
- #6: Social login partially resolved -- Kakao real, Naver still stub
- #9: Payment double-fire -- resolved in v2.1

## Open Issues (v3.0)
- HIGH: #13 Inquiry API returns Page, frontend expects array (useInquiries.ts)
- HIGH: #14 Coupon validFrom field missing from backend CouponResponse (fmtDate will error)
- MEDIUM: #5 mergeCartWithServer TODO stub, #15 inquiry answer lacks admin role check
- LOW: #2 Cart POST/PUT generic type, #4 Product type in mock/, #7 mock banners,
  #8 reload on cancel, #10 TOCTOU, #11 transactionId dup, #12 PaymentConfirmResponse,
  #16 Inquiry N+1, #17 ProductSummary missing shippingFee, #18 addressStore legacy,
  #19 zip code stub, #20 duplicate Kakao shipping API calls

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

## Config Concerns
- JWT_SECRET has hardcoded default in application.yml
- sql.init.mode: always (should be embedded/never for prod)
- No .env.example files exist
- No frontend container in docker-compose.yml

## File Paths (absolute)
- Analysis doc: C:/projects/shopping/fashion-mall/docs/03-analysis/shop.analysis.md
- Frontend src: C:/projects/shopping/fashion-mall/fashion-mall/src/
- Backend src: C:/projects/shopping/fashion-mall/backend/src/main/java/com/shop/
- New hooks: fashion-mall/src/hooks/useCoupons.ts, useInquiries.ts, useAddresses.ts
- New pages: fashion-mall/src/pages/MyPage/CouponPage.tsx, InquiryPage.tsx, AddressPage.tsx, AddressFormPage.tsx, WithdrawPage.tsx
- New backend: backend/.../domain/coupon/, domain/inquiry/, domain/address/
