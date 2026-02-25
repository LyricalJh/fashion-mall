# Shop Project Changelog

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

