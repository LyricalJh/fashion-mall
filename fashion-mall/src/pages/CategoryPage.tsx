import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Container from '../components/ui/Container'
import ProductGrid from '../components/home/ProductGrid'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import type { ProductSummary } from '../types/api'
import type { Product } from '../mock/products'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toMockProduct(p: ProductSummary): Product {
  return {
    id: String(p.id),
    brand: p.categoryName,
    name: p.name,
    price: p.price,
    imageUrl: p.thumbnailUrl ?? `https://picsum.photos/seed/${p.id}/400/600`,
    colors: [],
    sizes: [],
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'recommended', label: '추천순',   apiSort: undefined     },
  { value: 'newest',      label: '신상품순', apiSort: 'id,desc'     },
  { value: 'price-asc',   label: '낮은가격순', apiSort: 'price,asc' },
  { value: 'price-desc',  label: '높은가격순', apiSort: 'price,desc' },
] as const

type SortValue = typeof SORT_OPTIONS[number]['value']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const catId = categoryId ? parseInt(categoryId, 10) : undefined

  const [sort, setSort] = useState<SortValue>('recommended')
  const [page, setPage] = useState(0)
  const [sortOpen, setSortOpen] = useState(false)

  const { categories } = useCategories()
  const category = categories.find((c) => c.id === catId)
  const categoryLabel = category?.name ?? '카테고리'

  const currentSort = SORT_OPTIONS.find((o) => o.value === sort)

  const { products: rawProducts, pagination, isLoading } = useProducts({
    categoryId: catId,
    sort: currentSort?.apiSort,
    page,
    size: 20,
  })

  const displayProducts = rawProducts.map(toMockProduct)
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
        <span className="text-sm text-gray-400">총 {pagination.totalElements}개</span>
      </div>

      {/* Sort bar */}
      <div className="mb-6 flex items-center justify-end gap-3 border-b border-gray-200 pb-4">
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
                      onClick={() => { setSort(opt.value); setSortOpen(false); setPage(0) }}
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

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : displayProducts.length > 0 ? (
        <>
          <ProductGrid products={displayProducts} />
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`h-9 w-9 rounded text-sm font-medium transition-colors ${
                    page === i
                      ? 'bg-gray-900 text-white'
                      : 'border border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="py-24 text-center">
          <p className="text-gray-400">해당 카테고리에 상품이 없습니다.</p>
        </div>
      )}
    </Container>
  )
}
