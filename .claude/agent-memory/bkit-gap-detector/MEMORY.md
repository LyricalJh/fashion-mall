# Gap Detector Memory - Shop Project

## Last Analysis: 2026-02-25
- Overall Match Rate: 72%
- Backend: 98% complete (all APIs, models, architecture)
- Frontend infra: 100% (apiClient, hooks, types, authStore exist)
- Frontend page wiring: 0% (all pages use mock data)

## Key Gap: Frontend Mock vs API
- Pages import from `mock/*.ts` instead of using hooks (useProducts, useCart, etc.)
- CartPage uses local Zustand store (useStore) not API-connected useCart hook
- LoginPage uses stub login, never calls lib/auth.ts
- Two incompatible cart models: types/cart.ts (local) vs types/api.ts (API)

## Backend Verified Patterns
- ApiResponse<T> with {success, data, error} format
- All controllers return DTOs, never entities
- Fetch Join for N+1 prevention in ProductRepository, OrderRepository
- OrderService uses DB price (not request price) for order items
- JWT: Access 1h, Refresh 7d in JwtUtil constants

## Config Concerns
- JWT_SECRET has hardcoded default in application.yml
- sql.init.mode: always (should be embedded/never for prod)
- No .env.example files exist
- No frontend container in docker-compose.yml
