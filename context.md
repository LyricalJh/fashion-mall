# Fashion Mall — Project Context

> 이 파일은 프로젝트의 맥락을 유지하기 위한 문서입니다.
> 새 작업을 시작할 때 반드시 이 파일을 먼저 읽고 기존 맥락을 확인하세요.

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 목적 | 패션 쇼핑몰 메인 페이지 프론트엔드 MVP |
| 참조 사이트 | shinsegaev.com (레이아웃 패턴만 참고, 에셋/텍스트 복사 금지) |
| 상태 | **진행 중** — 홈·상품상세·장바구니 완성, Category·Checkout stub, 모바일 하단 내비게이션 완성 |
| 실행 | `npm install` → `npm run dev` (node가 PATH에 없으면 아래 참고) |

### 개발 서버 실행 (Windows 환경 주의)
```bash
# node가 PATH에 없는 Windows 환경이므로 아래 방법으로 실행
PATH="/c/Program Files/nodejs:$PATH" "/c/Program Files/nodejs/npm.cmd" run dev
# → http://localhost:5173 (또는 5174)
```

---

## 기술 스택

| 패키지 | 버전 | 비고 |
|--------|------|------|
| React | ^19.2.0 | |
| Vite | ^7.3.1 | `@vitejs/plugin-react-swc` |
| TypeScript | ~5.9.3 | |
| Tailwind CSS | ^4.2.0 | v4 방식: `@import "tailwindcss"`, `@tailwindcss/vite` 플러그인, **tailwind.config.js 없음** |
| React Router DOM | ^7.13.0 | `createBrowserRouter` 사용 |
| Zustand | ^5.0.11 | |
| SWR | ^2.4.0 | 설치됨, 아직 미사용 (API 레이어 준비용) |

---

## 폴더 구조

```
fashion-mall/
├── src/
│   ├── App.tsx                  # RouterProvider 진입점
│   ├── main.tsx                 # React root 렌더링
│   ├── index.css                # Tailwind v4 import + 글로벌 리셋
│   ├── routes/
│   │   └── index.tsx            # createBrowserRouter 라우트 정의
│   ├── store/
│   │   └── useStore.ts          # Zustand 스토어
│   ├── mock/                    # 더미 데이터 (백엔드 연동 전)
│   │   ├── categories.ts
│   │   ├── banners.ts
│   │   ├── products.ts          # 32개 더미 상품
│   │   └── sections.ts          # 7개 홈 섹션
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx        # Header + CatalogNav + Outlet + Footer(desktop) + MobileBottomNav
│   │   │   ├── Header.tsx           # sticky; 모바일: 로고만(h-12) / 데스크탑: 검색바+아이콘(h-16)
│   │   │   ├── CatalogNav.tsx       # desktop 가로 메뉴만 (mobile 햄버거 제거됨)
│   │   │   ├── MobileBottomNav.tsx  # 모바일 전용 5-탭 하단 바 + 카테고리 슬라이드업 시트
│   │   │   └── Footer.tsx           # 데스크탑에서만 표시 (모바일 hidden)
│   │   ├── home/
│   │   │   ├── HeroCarousel.tsx # 3-패널 캐러셀 (desktop 3 / tablet 2 / mobile 1), 자동재생, dots
│   │   │   ├── SectionBlock.tsx # 섹션 타이틀 + View All + ProductGrid
│   │   │   ├── ProductGrid.tsx  # 반응형 그리드
│   │   │   └── ProductCard.tsx  # 카드, 하트 토글, 뱃지, 호버 줌
│   │   ├── product/
│   │   │   └── ProductImageViewer.tsx # 썸네일 목록 + 메인 이미지 + 줌 모달
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── IconButton.tsx
│   │       ├── Badge.tsx        # HOT / NEW / BEST / SALE
│   │       ├── Price.tsx        # 할인율 + 원가 포맷
│   │       └── Container.tsx    # max-width 래퍼
│   └── pages/
│       ├── HomePage.tsx         # ✅ 완성
│       ├── CategoryPage.tsx     # 🔲 stub
│       ├── ProductDetailPage.tsx# ✅ 완성
│       ├── CartPage.tsx         # ✅ 완성
│       ├── CheckoutPage.tsx     # 🔲 stub
│       └── MyPage/
│           ├── MyPageLayout.tsx     # 2-column(desktop) / single-column(mobile)
│           ├── MyPageSidebar.tsx    # NavLink 그룹 메뉴 (desktop nav + mobile card list)
│           ├── OrderListPage.tsx    # ✅ stub
│           ├── CancelReturnPage.tsx # ✅ stub
│           ├── CouponPage.tsx       # ✅ stub
│           ├── InquiryPage.tsx      # ✅ stub
│           ├── AddressPage.tsx      # ✅ stub
│           └── WithdrawPage.tsx     # ✅ stub
├── index.html                   # SEO 메타 태그 추가 필요 → 아래 참고
├── vite.config.ts
├── context.md                   # ← 이 파일
└── TODO.md                      # 원본 요구사항
```

---

## 라우트 구조

| Path | Page | 상태 |
|------|------|------|
| `/` | HomePage | ✅ 완성 |
| `/category/:slug` | CategoryPage | 🔲 stub |
| `/product/:id` | ProductDetailPage | ✅ 완성 |
| `/cart` | CartPage | ✅ 완성 |
| `/checkout` | CheckoutPage | 🔲 stub |
| `/mypage` | → redirect to `/mypage/orders` | — |
| `/mypage/orders` | OrderListPage | ✅ stub |
| `/mypage/returns` | CancelReturnPage | ✅ stub |
| `/mypage/coupon` | CouponPage | ✅ stub |
| `/mypage/inquiry` | InquiryPage | ✅ stub |
| `/mypage/address` | AddressPage | ✅ stub |
| `/mypage/withdraw` | WithdrawPage | ✅ stub |

---

## 상태 관리 (Zustand — `src/store/useStore.ts`)

```ts
favorites: Set<string>                            // 찜한 상품 ID 집합
cartItems: CartItem[]                             // 장바구니 아이템 배열
toggleFavorite(id)                                // 찜 토글
addToCart(item) / removeFromCart(id)              // 카트 추가/제거
updateQuantity(id, quantity)                      // 수량 변경
toggleSelect(id) / toggleSelectAll(selected)      // 선택 상태 토글
deleteSelected() / clearCart()                    // 선택 삭제 / 전체 삭제
```

- `localStorage` persist (`stylehub-cart` key)
- 카트 배지 카운트: `cartItems.reduce((sum, it) => sum + it.quantity, 0)`

---

## 더미 데이터 (`src/mock/`)

### 데이터 타입

```ts
Category    { id, label, slug }
Banner      { id, title, subtitle?, imageUrl, bgColor }
Product     { id, brand, name, price, originalPrice?, discountRate?, imageUrl, badge? }
HomeSection { key, title, productIds }
```

### 홈 섹션 (7개, 순서 고정)
1. Today Best
2. Brand Pick
3. HOT DEAL
4. Favorite Brand
5. What's up
6. New Arrival
7. This Week

### 카탈로그 카테고리 (9개)
브랜드 / 여성 / 남성 / 패션잡화 / 뷰티 / 골프 / 리빙 / 키즈 / 스포츠

### 이미지
picsum.photos seed 방식 사용 (결정적, 백엔드 없이 일관된 이미지)
예: `https://picsum.photos/seed/coat1/400/500`

### 배너 데이터 (8개)
`bgColor` 제거, `badgeText?: string` 추가 (NEW / SALE / HOT / BEST)
배너 수: 8개 (3-패널 캐러셀 슬라이딩에 충분한 수량)

---

## 반응형 브레이크포인트 (Tailwind)

| 구간 | 클래스 | 상품 그리드 컬럼 |
|------|--------|----------------|
| Mobile | default | 2 |
| Tablet | `md` (768px+) | 3~4 |
| Desktop | `lg` (1024px+) / `xl` (1280px+) | 5~6 |

---

## 모바일 레이아웃 (< md / 768px)

앱 스타일 하단 내비게이션 패턴 적용.

| 영역 | 모바일 | 데스크탑 |
|------|--------|---------|
| Header | 로고만 (`h-12`) | 로고 + 검색바 + 아이콘 (`h-16`) |
| CatalogNav | 숨김 (햄버거 제거) | 가로 카테고리 메뉴 |
| 하단 탭 바 | `MobileBottomNav` 고정 표시 | 숨김 |
| Footer | 숨김 | 표시 |
| `<main>` | `pb-16` (탭 바 높이만큼 여백) | `pb-0` |

### MobileBottomNav 탭 구성

| 탭 | 경로 | active 조건 |
|----|------|------------|
| 홈 | `/` | `pathname === '/'` |
| 카테고리 | — | 슬라이드업 시트 토글 / `pathname.startsWith('/category')` |
| 찜 | — | 항상 비활성 (미구현) |
| 장바구니 | `/cart` | `pathname === '/cart'` (배지 표시) |
| 마이 | — | 항상 비활성 (미구현) |

- `/cart`, `/checkout`, `/order-complete` 에서는 `MobileBottomNav` 자체를 `return null`
- 카테고리 슬라이드업 시트: 9개 카테고리 3열 그리드, 클릭 시 해당 경로로 이동 + 시트 닫힘
- active 색상: `rose-500`, inactive: `gray-400`

---

## 디자인 시스템

- **브랜드명**: STYLE**HUB** (HUB = `text-rose-500`)
- **팔레트**: black/white/gray 기반, accent = `rose-500` / `rose-600`
- **뱃지 색상**: HOT=red-500, NEW=emerald-500, BEST=amber-500, SALE=rose-600
- **카드 호버**: image scale-105 + 오버레이 bg-black/5

---

## SEO 최적화 계획 및 현황

### 현재 상태
- `index.html`에 기본 타이틀만 존재, 메타 태그 미설정
- SPA 구조이므로 클라이언트 사이드 렌더링 → 동적 메타 태그 관리 필요

### 적용할 SEO 항목

#### 1. `index.html` — 정적 기본 메타 태그
```html
<!-- 기본 SEO -->
<meta name="description" content="...">
<meta name="keywords" content="...">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://yourdomain.com/">

<!-- Open Graph (SNS 공유) -->
<meta property="og:type" content="website">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<meta property="og:url" content="...">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="...">
```

#### 2. 동적 메타 태그 — react-helmet-async (설치 필요)
- 페이지별 title / description / og:tags 동적 변경
- `<HelmetProvider>` → `<Helmet>` 패턴

```bash
npm install react-helmet-async
```

#### 3. 구조화 데이터 (JSON-LD)
상품 페이지에 `Product` 스키마, 홈에 `WebSite` + `SearchAction` 스키마 추가

#### 4. 성능 (Core Web Vitals)
- 이미지: `loading="lazy"` ✅ 이미 적용됨
- 이미지: `width` / `height` 속성 명시 → CLS 방지
- HeroCarousel 첫 번째 슬라이드 이미지: `loading="eager"` + `fetchpriority="high"`
- Vite 빌드: 코드 스플리팅 (React Router lazy 적용 권장)

#### 5. 기술적 SEO
- `public/robots.txt` 생성
- `public/sitemap.xml` 생성 (정적 라우트 기반)
- 404 페이지 (`src/pages/NotFoundPage.tsx`) 추가

#### 6. 접근성 (a11y) — SEO 연관
- 이미지 `alt` 텍스트 구체화 (현재 product.name 사용 중 ✅)
- 시맨틱 HTML: `<main>`, `<nav>`, `<section>`, `<article>` ✅ 일부 적용
- `aria-label` 아이콘 버튼에 적용 ✅

### SEO 작업 우선순위

| 우선순위 | 작업 | 난이도 |
|---------|------|--------|
| 🔴 High | index.html 기본 메타 태그 추가 | 쉬움 |
| 🔴 High | react-helmet-async 도입 + 페이지별 메타 | 보통 |
| 🟡 Mid | robots.txt / sitemap.xml | 쉬움 |
| 🟡 Mid | JSON-LD 구조화 데이터 (상품 페이지) | 보통 |
| 🟡 Mid | 404 페이지 추가 | 쉬움 |
| 🟢 Low | React Router lazy 코드 스플리팅 | 보통 |
| 🟢 Low | LCP 이미지 fetchpriority 최적화 | 쉬움 |

---

## 앞으로 할 작업 (백로그)

- [ ] **SEO**: index.html 메타 태그 + react-helmet-async 도입
- [ ] **SEO**: robots.txt, sitemap.xml 생성
- [ ] **SEO**: JSON-LD 구조화 데이터
- [ ] **페이지**: CategoryPage UI 구현
- [x] **페이지**: ProductDetailPage UI 구현
- [x] **페이지**: CartPage UI 구현
- [ ] **페이지**: CheckoutPage UI 구현
- [x] **페이지**: MyPage 기본 구조 구현 (Layout + Sidebar + 6개 stub)
- [x] **모바일**: 하단 탭 내비게이션 (MobileBottomNav) 구현
- [ ] **MyPage**: 주문목록 mock 데이터 연결
- [ ] **MyPage**: 찜(favorites) 탭 페이지 연결
- [ ] **MyPage**: 회원정보 수정 페이지 추가
- [ ] **기능**: 검색 기능 연결
- [ ] **기능**: React Router lazy 코드 스플리팅
- [ ] **기능**: SWR 기반 API 레이어 연결
- [ ] **기능**: 404 NotFoundPage 추가

---

## 환경 메모

- **OS**: Windows 10 Pro
- **Node**: v24.13.1 (`C:\Program Files\nodejs\`)
- **npm**: v11.7.0
- **Shell**: Git Bash (bash) — `node`가 PATH에 자동 등록되지 않음
- **IDE**: VS Code (파일 열기 이벤트로 확인)


## TODO
_완료된 스펙 없음 — 위 백로그 참고._