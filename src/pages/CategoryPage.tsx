import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import Container from '../components/ui/Container'
import ProductGrid from '../components/home/ProductGrid'
import { products } from '../mock/products'
import { categories } from '../mock/categories'

// ─── Constants ────────────────────────────────────────────────────────────────

// 카테고리별 상품 인덱스 (mock — 실제 API 연동 전 시뮬레이션)
const CATEGORY_INDICES: Record<string, number[]> = {
  brand:       Array.from({ length: 32 }, (_, i) => i),
  women:       [1,3,7,9,13,15,17,19,21,23,25,27,29,31],
  men:         [0,2,4,5,6,8,10,11,14,18,22,24,26,30],
  accessories: [3,7,11,15,19,23,27,31],
  beauty:      [4,8,12,16,20,24,28,0],
  golf:        [6,10,14,18,22,26,30,2],
  living:      [7,11,15,19,23,27,31,3],
  kids:        [0,4,8,12,16,20,24,28],
  sports:      [5,9,13,17,21,25,29,1],
}

const SORT_OPTIONS = [
  { value: 'recommended', label: '추천순' },
  { value: 'newest',      label: '신상품순' },
  { value: 'price-asc',   label: '낮은가격순' },
  { value: 'price-desc',  label: '높은가격순' },
  { value: 'discount',    label: '할인율순' },
] as const

type SortValue = typeof SORT_OPTIONS[number]['value']

const BADGE_FILTERS = ['전체', 'HOT', 'NEW', 'BEST', 'SALE'] as const
type BadgeFilter = typeof BADGE_FILTERS[number]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [sort, setSort] = useState<SortValue>('recommended')
  const [badgeFilter, setBadgeFilter] = useState<BadgeFilter>('전체')
  const [sortOpen, setSortOpen] = useState(false)

  const category = categories.find((c) => c.slug === slug)
  const categoryLabel = category?.label ?? slug ?? ''

  // 카테고리에 속한 상품 추출
  const baseProducts = useMemo(() => {
    const indices = CATEGORY_INDICES[slug ?? ''] ?? CATEGORY_INDICES['brand']
    return indices.map((i) => products[i]).filter(Boolean)
  }, [slug])

  // 뱃지 필터 + 정렬 적용
  const displayProducts = useMemo(() => {
    let list = badgeFilter === '전체'
      ? baseProducts
      : baseProducts.filter((p) => p.badge === badgeFilter)

    switch (sort) {
      case 'newest':     return [...list].reverse()
      case 'price-asc':  return [...list].sort((a, b) => a.price - b.price)
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price)
      case 'discount':   return [...list].sort((a, b) => (b.discountRate ?? 0) - (a.discountRate ?? 0))
      default:           return list
    }
  }, [baseProducts, sort, badgeFilter])

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? ''

  return (
    <Container className="py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-sm text-gray-400" aria-label="breadcrumb">
        <Link to="/" className="transition-colors hover:text-gray-900">홈</Link>
        <span aria-hidden="true">/</span>
        <span className="text-gray-900">{categoryLabel}</span>
      </nav>

      {/* Page heading */}
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{categoryLabel}</h1>
        <span className="text-sm text-gray-400">총 {displayProducts.length}개</span>
      </div>

      {/* Filter / Sort bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        {/* Badge filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {BADGE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setBadgeFilter(f)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                badgeFilter === f
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setSortOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-400"
          >
            {currentSortLabel}
            <svg className={`h-3.5 w-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {sortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
              <ul className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                {SORT_OPTIONS.map((opt) => (
                  <li key={opt.value}>
                    <button
                      onClick={() => { setSort(opt.value); setSortOpen(false) }}
                      className={`w-full px-4 py-2.5 text-left text-xs transition-colors hover:bg-gray-50 ${
                        sort === opt.value ? 'font-semibold text-gray-900' : 'text-gray-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Product grid */}
      {displayProducts.length > 0 ? (
        <ProductGrid products={displayProducts} />
      ) : (
        <div className="py-24 text-center">
          <p className="text-gray-400">해당 조건의 상품이 없습니다.</p>
          <button
            onClick={() => setBadgeFilter('전체')}
            className="mt-4 text-sm text-rose-500 hover:underline"
          >
            필터 초기화
          </button>
        </div>
      )}
    </Container>
  )
}
