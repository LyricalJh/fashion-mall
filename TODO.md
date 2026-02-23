# Fashion Mall MVP (React) — UI Spec for Claude Code

## Goal
Build a **front-end only MVP** (screen-first) for a fashion shopping mall main page inspired by the reference site below.  
Focus on **layout, responsiveness, reusable components, and clean code structure**.  
Use **dummy data** first (JSON in code). No backend integration yet.

### Reference
- https://www.shinsegaev.com/zone/main/init.siv

> Important: Use the reference for **UX/layout patterns only**.  
> Do **not** copy brand assets, logos, text, images, or pixel-perfect styling.  
> Use placeholder images/text and a distinct design system.

---

## Tech Stack
- Vite + React + TypeScript
- Tailwind CSS (responsive: mobile / tablet / desktop)
- React Router DOM (routes scaffold)
- Zustand (client UI state: e.g., favorites, cart count)
- SWR (optional now; prepare API layer structure)

---

## MVP Pages (Routing)
- `/` : Main page (home)
- `/category/:slug` : Category product list (stub UI)
- `/product/:id` : Product detail (stub UI)
- `/cart` : Cart (stub UI)
- `/checkout` : Checkout (stub UI)

> For now, only the **Home page** needs a polished UI. Others can be simple placeholders.

---

## Home Page UI Requirements (MVP)

### 1) Header (Top)
- Left: Brand placeholder (text logo)
- Center: Search input (non-functional ok)
- Right: Icons (Login, Favorites, Cart) + cart count badge (state with Zustand)
- Sticky header on scroll (optional but recommended)

### 2) Catalog Navigation (below header)
Horizontal nav menu with these items (exact order not critical):
- 브랜드, 여성, 남성, 패션잡화, 뷰티, 골프, 리빙, etc.

Behavior:
- Desktop: horizontal menu
- Mobile: hamburger → drawer/slide menu (simple)

### 3) Hero Banner Carousel (below catalog)
A rotating banner carousel with:
- Auto-play
- Dots indicator
- Prev/Next buttons (desktop)
- Swipe on mobile (optional)
- Ideal banner unit: **full width** with responsive height
- Use placeholder images (or gradient blocks) + short headline text overlay

### 4) Chapter Sections (multiple)
Each chapter block consists of:
- Section title
- Optional “View All” link (to a category/list stub)
- Product grid under the title

Chapters (exact strings):
- Today Best
- Brand Pick
- HOT DEAL
- Favorite Brand
- What’s up
- New Arrival
- This Week

### 5) Product Grid (under each chapter)
- Use cards in a responsive grid
- Desktop: 4–6 columns depending on width
- Tablet: 2–3 columns
- Mobile: 2 columns (or 1 column if you prefer readability)

Each product card displays:
- Thumbnail image
- Brand name
- Product name
- Price
- Discount rate + original price (optional)
- Badge (e.g., HOT, NEW, BEST) (optional)
- Heart icon (favorite toggle via Zustand)

Card behavior:
- Hover (desktop): subtle elevation + image zoom (light)
- Click → navigate `/product/:id`

---

## Components to Implement (Reusable)
Create these components with clean props types:

### Layout
- `AppLayout` (header + nav + footer wrapper)
- `Header`
- `CatalogNav`
- `Footer` (simple)

### Home Sections
- `HeroCarousel`
- `SectionBlock` (title + optional action)
- `ProductGrid`
- `ProductCard`

### Common UI
- `Button`
- `IconButton`
- `Badge`
- `Price` (formatting helper)
- `Container` (max-width wrapper)

---

## State (Zustand) — Minimum
- `favorites`: Set of product IDs
- `cartCount`: number (mock)
- Methods: `toggleFavorite(id)`, `incrementCart()`, `decrementCart()`

---

## Data Model (Dummy Data)
Create a `src/mock/` folder with:
- `categories.ts`
- `banners.ts`
- `products.ts`
- `sections.ts` (which products belong to each chapter)

Types:
- `Category { id, label, slug }`
- `Banner { id, title, subtitle?, imageUrl }`
- `Product { id, brand, name, price, originalPrice?, discountRate?, imageUrl, badge? }`
- `HomeSection { key, title, productIds }`

---

## Responsive Rules (Minimum)
- Use Tailwind breakpoints:
    - Mobile: default
    - `md` for tablet
    - `lg/xl` for desktop
- Keep spacing/typography consistent:
    - Titles: bold, clear hierarchy
    - Cards: consistent padding, radius, shadow

---

## Styling Guidance
- Clean, modern, minimal e-commerce vibe
- Use neutral palette by default (black/white/gray)
- Use subtle accent color for buttons/badges (choose one)
- Avoid copying reference’s exact colors/typography.

---

## Acceptance Checklist
- [ ] Home page shows header + catalog nav
- [ ] Banner carousel auto-rotates and is responsive
- [ ] 7 chapter sections render in order with grids
- [ ] Product cards look consistent and clickable
- [ ] Favorite toggle works (Zustand state)
- [ ] Cart count badge visible (mock)
- [ ] Mobile layout works (nav collapses + grids adjust)

---

## Deliverables
- A working Vite React project that runs with:
    - `npm install`
    - `npm run dev`
- Clean folder structure (`components/`, `pages/`, `mock/`, `store/`, `routes/`)
- No backend required; dummy data only
- All UI must be responsive

---

## Notes / Constraints
- Do not scrape/copy the reference site’s assets or exact HTML/CSS.
- Use placeholders and recreate layout patterns in your own design system.
- Keep code readable and modular (small components, typed props).