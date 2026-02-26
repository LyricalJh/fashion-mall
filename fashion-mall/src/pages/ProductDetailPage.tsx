import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Container from '../components/ui/Container'
import ProductImageViewer, { type ProductImage } from '../components/product/ProductImageViewer'
import Price from '../components/ui/Price'
import Button from '../components/ui/Button'
import ProductDetailArea from '../components/product/ProductDetailArea'
import MobileProductActionBar from '../components/product/MobileProductActionBar'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/authStore'
import { useProduct } from '../hooks/useProduct'
import { useCart } from '../hooks/useCart'
import { useAvailableCoupons } from '../hooks/useCoupons'
import type { ProductDetail, Coupon } from '../types/api'
import type { Product } from '../mock/products'

// ─── Coupon helpers ──────────────────────────────────────────────────────────

function calculateDiscount(coupon: Coupon, price: number): number {
  if (price < coupon.minOrderAmount) return 0
  if (coupon.discountType === 'PERCENTAGE') {
    const discount = Math.floor(price * coupon.discountValue / 100)
    return coupon.maxDiscountAmount ? Math.min(discount, coupon.maxDiscountAmount) : discount
  }
  return coupon.discountValue
}

function fmtKRW(n: number): string {
  return n.toLocaleString('ko-KR')
}

// ─── Adapter ──────────────────────────────────────────────────────────────────

function toMockProduct(p: ProductDetail): Product {
  return {
    id: String(p.id),
    brand: p.categoryName,
    name: p.name,
    price: p.price,
    imageUrl: p.images[0] ?? `https://picsum.photos/seed/${p.id}/400/600`,
    colors: [],
    sizes: [],
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToastState {
  msg: string
  action?: { label: string; onClick: () => void }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { id } = useParams()
  const productId = id ? parseInt(id, 10) : null
  const { product: apiProduct, isLoading, error } = useProduct(productId)
  const { addToCart: addToCartStore } = useStore()
  const { addToCart: addToCartApi } = useCart()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const { coupons: availableCoupons } = useAvailableCoupons()
  const navigate = useNavigate()
  const [toast, setToast] = useState<ToastState | null>(null)
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null)

  const product = apiProduct ? toMockProduct(apiProduct) : null

  const showToast = useCallback((msg: string, action?: { label: string; onClick: () => void }) => {
    setToast({ msg, action })
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  if (isLoading) {
    return (
      <Container className="py-16 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </Container>
    )
  }

  if (error || !product || !apiProduct) {
    return (
      <Container className="py-16 text-center">
        <p className="text-gray-500">상품을 찾을 수 없습니다.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-rose-600 hover:underline">
          홈으로 돌아가기
        </Link>
      </Container>
    )
  }

  const images: ProductImage[] = apiProduct.images.length > 0
    ? apiProduct.images.map((url, i) => ({ id: String(i), url, alt: product.name }))
    : [
        { id: '1', url: product.imageUrl, alt: product.name },
        { id: '2', url: `https://picsum.photos/seed/${product.id}-b/400/600`, alt: product.name },
        { id: '3', url: `https://picsum.photos/seed/${product.id}-c/400/600`, alt: product.name },
        { id: '4', url: `https://picsum.photos/seed/${product.id}-d/400/600`, alt: product.name },
      ]

  function buildCartItem() {
    return {
      id: product!.id,
      brand: product!.brand,
      name: product!.name,
      optionText: '기본 옵션',
      imageUrl: product!.imageUrl,
      price: product!.price,
      quantity: 1,
      selected: true,
    }
  }

  async function handleAddToCart() {
    if (isLoggedIn && productId !== null) {
      try {
        await addToCartApi(productId, 1)
        showToast('장바구니에 담겼어요', {
          label: '장바구니 바로 가기',
          onClick: () => navigate('/cart'),
        })
      } catch {
        showToast('장바구니 추가에 실패했습니다. 다시 시도해주세요.')
      }
    } else {
      addToCartStore(buildCartItem())
      showToast('장바구니에 담겼어요', {
        label: '장바구니 바로 가기',
        onClick: () => navigate('/cart'),
      })
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
            <Price price={product.price} />
          </div>

          {/* Desktop action buttons */}
          <div className="hidden md:contents">
            <div className="flex gap-2 pt-1">
              <Button size="lg" variant="outline" className="flex-1" onClick={handleAddToCart}>
                장바구니 담기
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={() => navigate('/checkout', { state: { directItem: buildCartItem() } })}
              >
                바로 구매
              </Button>
            </div>
          </div>

          {/* Product description */}
          <div className="border-t border-gray-100 pt-4 text-sm leading-relaxed text-gray-500">
            {apiProduct.description ? (
              <p>{apiProduct.description}</p>
            ) : (
              <>
                <p>고급 소재로 제작된 세련된 스타일의 {product.name}입니다.</p>
                <p className="mt-1">다양한 코디에 활용 가능하며 시즌리스 아이템으로 추천드립니다.</p>
              </>
            )}
          </div>

          {/* Shipping info */}
          <div className="rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">배송비</span>
              {apiProduct.shippingFee != null && apiProduct.shippingFee === 0 ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">무료배송</span>
              ) : apiProduct.shippingFee != null ? (
                <span className="text-gray-900">{fmtKRW(apiProduct.shippingFee)}원</span>
              ) : (
                <span>무료배송 (3만원 이상 구매 시)</span>
              )}
            </div>
            <p className="mt-1.5">
              {apiProduct.shippingInfo || '일반택배 / 영업일 기준 2~3일 내 출고'}
            </p>
            <p className="mt-1">• 교환 및 반품: 수령 후 7일 이내</p>
          </div>

          {/* Coupon discount */}
          {isLoggedIn && availableCoupons.length > 0 && (
            <div className="rounded-lg border border-rose-100 bg-rose-50/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M20 12V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6m0 0v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6" />
                  <line x1="12" y1="7" x2="12" y2="17" strokeDasharray="2 2" />
                </svg>
                <span className="text-xs font-semibold text-gray-700">쿠폰 할인</span>
              </div>
              <select
                value={selectedCouponId ?? ''}
                onChange={(e) => setSelectedCouponId(e.target.value ? Number(e.target.value) : null)}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-100"
              >
                <option value="">쿠폰을 선택하세요</option>
                {availableCoupons.map((c) => {
                  const disc = calculateDiscount(c, product.price)
                  const applicable = disc > 0
                  return (
                    <option key={c.id} value={c.id} disabled={!applicable}>
                      {c.couponName} ({c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `${fmtKRW(c.discountValue)}원`} 할인)
                      {!applicable ? ` - ${fmtKRW(c.minOrderAmount)}원 이상 구매 시` : ''}
                    </option>
                  )
                })}
              </select>
              {selectedCouponId && (() => {
                const coupon = availableCoupons.find((c) => c.id === selectedCouponId)
                if (!coupon) return null
                const discount = calculateDiscount(coupon, product.price)
                if (discount <= 0) return null
                const discountedPrice = product.price - discount
                return (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">쿠폰 적용 시</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 line-through">{fmtKRW(product.price)}원</span>
                      <span className="text-sm font-bold text-rose-600">{fmtKRW(discountedPrice)}원</span>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
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
