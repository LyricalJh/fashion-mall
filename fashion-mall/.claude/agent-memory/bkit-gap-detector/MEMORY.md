# Gap Detector Memory - Fashion Mall

## Project Structure
- Frontend: `/Users/junghanso/Documents/shop/fashion-mall` (React 19 + Vite + TS + Tailwind v4 + Zustand + SWR)
- Backend: `/Users/junghanso/Documents/shop/backend` (Spring Boot 3.3.5 + Java 17)
- Analysis output: `/Users/junghanso/Documents/shop/docs/03-analysis/shop.analysis.md`

## Analysis History
- v1.0 (2026-02-25): Overall 72%, Page Integration 0% -- all pages used mock data
- v2.0 (2026-02-26): Overall 93%, Page Integration 100% -- all core pages use real API

## Known Issues (from v2.0)
1. **Orders pagination mismatch**: Backend `GET /api/orders` returns `Page<OrderSummaryResponse>` but `useOrders()` expects `OrderSummaryResponse[]` -- will cause runtime error
2. **Cart badge ignores API cart**: `MobileBottomNav.tsx` reads local store only, not API cart count for logged-in users
3. **Product type in mock/**: `Product` interface is in `mock/products.ts`, should be in `types/`
4. **mergeCartWithServer TODO**: `useStore.ts` L75-77 stub for guest-to-API cart merge on login
5. **Cart POST/PUT generic type**: `useCart.ts` uses `apiPost<CartResponse>` but backend returns `CartItemResponse`

## Architecture Pattern
- Dynamic level folder structure (components, hooks, lib, store, types, pages)
- Adapter pattern: `toMockProduct()` functions bridge API types to legacy UI `Product` type
- Dual cart system: API (useCart) for logged-in, local (useStore) for guest
- Auth guard: `RequireAuth` wrapper in routes + SWR null-key pattern in hooks

## Backend Response Wrapper
All backend responses use `ApiResponse<T>` = `{ success: boolean, data: T, error?: { code, message } }`
Frontend `apiClient.parseResponse` extracts `json.data` automatically.
