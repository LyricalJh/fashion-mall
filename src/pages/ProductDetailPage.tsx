import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Container from '../components/ui/Container'
import ProductImageViewer, { type ProductImage } from '../components/product/ProductImageViewer'
import Badge from '../components/ui/Badge'
import Price from '../components/ui/Price'
import Button from '../components/ui/Button'
import ProductDetailArea from '../components/product/ProductDetailArea'
import MobileProductActionBar from '../components/product/MobileProductActionBar'
import { useStore } from '../store/useStore'
import { products } from '../mock/products'

interface ToastState {
  msg: string
  action?: { label: string; onClick: () => void }
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const product = products.find((p) => p.id === id)
  const { favorites, toggleFavorite, addToCart } = useStore()
  const navigate = useNavigate()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [validationMsg, setValidationMsg] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback((msg: string, action?: { label: string; onClick: () => void }) => {
    setToast({ msg, action })
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  // 데스크톱: 단일 옵션이면 자동 선택, 상품이 바뀌면 초기화
  useEffect(() => {
    if (!product) return
    setSelectedColor(product.colors.length === 1 ? product.colors[0].name : null)
    setSelectedSize(product.sizes.length === 1 ? product.sizes[0] : null)
    setValidationMsg(null)
  }, [product?.id])

  // 데스크톱 검증 — 선택이 필요한 옵션만 체크
  const validate = () => {
    if (!product) return false
    const noColor = product.colors.length >= 2 && !selectedColor
    const noSize = product.sizes.length >= 2 && !selectedSize
    if (noColor && noSize) { setValidationMsg('색상과 사이즈를 선택해 주세요.'); return false }
    if (noColor) { setValidationMsg('색상을 선택해 주세요.'); return false }
    if (noSize) { setValidationMsg('사이즈를 선택해 주세요.'); return false }
    setValidationMsg(null)
    return true
  }

  if (!product) {
    return (
      <Container className="py-16 text-center">
        <p className="text-gray-500">상품을 찾을 수 없습니다.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-rose-600 hover:underline">
          홈으로 돌아가기
        </Link>
      </Container>
    )
  }

  const isFav = favorites.has(product.id)

  const images: ProductImage[] = [
    { id: '1', url: product.imageUrl, alt: product.name },
    { id: '2', url: `https://picsum.photos/seed/${product.id}-b/400/600`, alt: product.name },
    { id: '3', url: `https://picsum.photos/seed/${product.id}-c/400/600`, alt: product.name },
    { id: '4', url: `https://picsum.photos/seed/${product.id}-d/400/600`, alt: product.name },
  ]

  function buildCartItem() {
    const color = selectedColor ?? (product.colors.length === 1 ? product.colors[0].name : null)
    const size = selectedSize ?? (product.sizes.length === 1 ? product.sizes[0] : null)
    const parts = [size && `사이즈: ${size}`, color && `컬러: ${color}`].filter(Boolean)
    const optionText = parts.length ? (parts as string[]).join(' / ') : '기본 옵션'
    const itemId = `${product.id}-${color ?? 'default'}-${size ?? 'default'}`
    return {
      id: itemId,
      brand: product.brand,
      name: product.name,
      optionText,
      imageUrl: product.imageUrl,
      price: product.price,
      originalPrice: product.originalPrice,
      discountRate: product.discountRate,
      quantity: 1,
      selected: true,
    }
  }

  return (
    <div className="pb-[68px] md:pb-0">
    {/* Toast */}
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 transition-all duration-300 md:bottom-6 ${
        toast ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 rounded-xl bg-gray-900 px-4 py-3.5 shadow-xl">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <p className="flex-1 text-sm font-medium text-white">{toast?.msg}</p>
        {toast?.action && (
          <button
            onClick={toast.action.onClick}
            className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-900 transition-colors hover:bg-gray-100"
          >
            {toast.action.label}
          </button>
        )}
        <button
          onClick={() => setToast(null)}
          className="shrink-0 text-gray-400 transition-colors hover:text-white"
          aria-label="닫기"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    <Container className="py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500" aria-label="breadcrumb">
        <Link to="/" className="hover:text-gray-900 transition-colors">홈</Link>
        <span aria-hidden="true">/</span>
        <span className="text-gray-900">{product.brand}</span>
      </nav>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Left — Image viewer */}
        <ProductImageViewer images={images} />

        {/* Right — Product info */}
        <div className="flex flex-col gap-5">
          {/* Badge */}
          {product.badge && (
            <div>
              <Badge
                label={product.badge}
                variant={product.badge.toLowerCase() as 'hot' | 'new' | 'best' | 'sale'}
              />
            </div>
          )}

          {/* Brand & name */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {product.brand}
            </p>
            <h1 className="mt-1.5 text-2xl font-bold text-gray-900 md:text-3xl">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="border-t border-gray-100 pt-4">
            <Price
              price={product.price}
              originalPrice={product.originalPrice}
              discountRate={product.discountRate}
            />
          </div>

          {/* ── 데스크톱 전용: 옵션 선택 (모바일은 MobileOptionBottomSheet에서 처리) ── */}
          <div className="hidden md:contents">
            {/* Color selector */}
            {product.colors.length >= 2 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    색상
                    {selectedColor && (
                      <span className="ml-2 font-normal text-gray-400">{selectedColor}</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => { setSelectedColor(color.name); setValidationMsg(null) }}
                      aria-label={color.name}
                      title={color.name}
                      className={`relative h-8 w-8 rounded-full transition-transform hover:scale-110 focus:outline-none ${
                        selectedColor === color.name
                          ? 'ring-2 ring-gray-900 ring-offset-2'
                          : 'ring-1 ring-gray-200'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes.length >= 2 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">사이즈</p>
                  <button className="text-xs text-gray-400 underline hover:text-gray-600">
                    사이즈 가이드
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setValidationMsg(null) }}
                      className={`h-10 min-w-[44px] rounded border px-3 text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Validation message */}
            {validationMsg && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
                {validationMsg}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (!validate()) return
                  addToCart(buildCartItem())
                  showToast('장바구니에 담겼어요', {
                    label: '장바구니 바로 가기',
                    onClick: () => navigate('/cart'),
                  })
                }}
              >
                장바구니 담기
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={() => {
                  if (!validate()) return
                  // 바로 구매: 장바구니에 추가하지 않고 상품 정보를 직접 전달
                  navigate('/checkout', { state: { directItem: buildCartItem() } })
                }}
              >
                바로 구매
              </Button>
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded border transition-colors focus:outline-none ${
                  isFav
                    ? 'border-rose-500 text-rose-500'
                    : 'border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-700'
                }`}
                aria-label={isFav ? '찜 해제' : '찜하기'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill={isFav ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={isFav ? 0 : 1.5}
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* ── /데스크톱 전용 ── */}

          {/* Product description */}
          <div className="border-t border-gray-100 pt-4 text-sm leading-relaxed text-gray-500">
            <p>고급 소재로 제작된 세련된 스타일의 {product.name}입니다.</p>
            <p className="mt-1">다양한 코디에 활용 가능하며 시즌리스 아이템으로 추천드립니다.</p>
          </div>

          {/* Shipping info */}
          <div className="rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500">
            <p>• 무료배송 (3만원 이상 구매 시)</p>
            <p className="mt-1">• 영업일 기준 2~3일 내 출고</p>
            <p className="mt-1">• 교환 및 반품: 수령 후 7일 이내</p>
          </div>
        </div>
      </div>
    </Container>
    <ProductDetailArea productId={product.id} />
    <MobileProductActionBar
      product={product}
      onShowToast={showToast}
    />
    </div>
  )
}
