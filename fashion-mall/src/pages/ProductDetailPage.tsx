import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Container from '../components/ui/Container'
import ProductImageViewer, { type ProductImage } from '../components/product/ProductImageViewer'
import ProductDetailArea from '../components/product/ProductDetailArea'
import MobileProductActionBar from '../components/product/MobileProductActionBar'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/authStore'
import { useProduct } from '../hooks/useProduct'
import { useCart } from '../hooks/useCart'
import { useAvailableCoupons } from '../hooks/useCoupons'
import { useProductLike } from '../hooks/useLikes'
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
  const { liked, toggleLike } = useProductLike(productId ?? 0)

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

        {/* Right — Product info (29CM style) */}
        <div className="mx-auto w-[85%] flex flex-col lg:mx-0 lg:w-full">
          {/* Brand + Name + Heart */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-medium text-gray-900 leading-snug">
                {product.name}
              </h1>
            </div>
            <button
              onClick={toggleLike}
              className="mt-0.5 shrink-0 p-1 transition-colors"
              aria-label={liked ? '좋아요 취소' : '좋아요'}
            >
              <svg
                className={`h-7 w-7 ${liked ? 'fill-red-500 text-red-500' : 'fill-none text-gray-400 hover:text-gray-600'}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </button>
          </div>

          {/* Star rating */}
          <div className="mt-2 flex items-center gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="h-3.5 w-3.5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <button className="border-b border-gray-400 text-xs text-gray-500 leading-none hover:text-gray-900">
              리뷰 보기
            </button>
          </div>

          {/* Price area */}
          <div className="mt-4 flex items-end justify-between border-t border-gray-200 pt-4">
            <div>
              <span className="text-2xl font-bold text-gray-900">{fmtKRW(product.price)}<span className="text-lg">원</span></span>
            </div>
            {isLoggedIn && availableCoupons.length > 0 && (
              <button className="rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors">
                쿠폰받기
              </button>
            )}
          </div>

          {/* Coupon discount (expandable) */}
          {isLoggedIn && availableCoupons.length > 0 && (() => {
            const bestCoupon = availableCoupons
              .map((c) => ({ coupon: c, discount: calculateDiscount(c, product.price) }))
              .filter((x) => x.discount > 0)
              .sort((a, b) => b.discount - a.discount)[0]
            if (!bestCoupon) return null
            const bestPrice = product.price - bestCoupon.discount
            const bestRate = Math.round((bestCoupon.discount / product.price) * 100)
            return (
              <details className="mt-3 group rounded-lg bg-gray-50">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-rose-500">{bestRate}%</span>
                    <span className="text-lg font-bold text-gray-900">{fmtKRW(bestPrice)}<span className="text-base">원</span></span>
                    <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-600">쿠폰 적용가</span>
                  </div>
                  <svg className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="border-t border-gray-200 px-4 py-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500">상품 쿠폰 할인</p>
                  {availableCoupons.map((c) => {
                    const disc = calculateDiscount(c, product.price)
                    const applicable = disc > 0
                    return (
                      <label key={c.id} className={`flex items-center justify-between py-1.5 ${!applicable ? 'opacity-40' : ''}`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="coupon"
                            value={c.id}
                            disabled={!applicable}
                            checked={selectedCouponId === c.id}
                            onChange={() => setSelectedCouponId(c.id)}
                            className="h-4 w-4 accent-gray-900"
                          />
                          <span className="text-sm text-gray-700">{c.couponName}</span>
                        </div>
                        <span className={`text-sm font-bold ${applicable ? 'text-gray-900' : 'text-gray-400'}`}>
                          -{fmtKRW(disc)}원
                        </span>
                      </label>
                    )
                  })}
                </div>
              </details>
            )
          })()}

          {/* Info table: 구매적립금 / 무이자할부 / 배송정보 / 배송비 */}
          <div className="mt-5 space-y-3 border-t border-gray-200 pt-5 text-sm">
            <div className="flex items-start">
              <span className="w-[76px] shrink-0 text-gray-400">구매 적립금</span>
              <div className="flex-1 text-gray-700">
                <span>최대 <span className="font-semibold text-blue-600">{fmtKRW(Math.round(product.price * 0.015))}원</span></span>
                <span className="text-gray-400"> (1.5% 적립)</span>
              </div>
            </div>
            <div className="flex items-start">
              <span className="w-[76px] shrink-0 text-gray-400">무이자 할부</span>
              <div className="flex-1">
                <p className="text-gray-700">최대 5개월 무이자 할부 시 월 {fmtKRW(Math.round(product.price / 5))}원</p>
                <button className="text-gray-500 underline text-xs mt-0.5">카드사별 할부 혜택 안내</button>
              </div>
            </div>
            <div className="flex items-start">
              <span className="w-[76px] shrink-0 text-gray-400">배송정보</span>
              <span className="flex-1 text-gray-700">
                {apiProduct.shippingInfo || '3일 이내 배송 시작'}
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-[76px] shrink-0 text-gray-400">배송비</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {apiProduct.shippingFee != null && apiProduct.shippingFee === 0
                    ? '무료배송'
                    : apiProduct.shippingFee != null
                      ? `${fmtKRW(apiProduct.shippingFee)}원`
                      : '3,000원'}
                </p>
                <p className="text-gray-500">70,000원 이상 구매시 무료배송</p>
                <p className="text-gray-500">제주/도서산간 3,000원 추가</p>
              </div>
            </div>
          </div>

          {/* Desktop action buttons (29CM style) */}
          <div className="mt-6 hidden gap-3 md:flex">
            <button
              onClick={handleAddToCart}
              className="h-12 flex-1 rounded border border-gray-900 text-base font-bold text-gray-900 transition-colors hover:bg-gray-50"
            >
              장바구니 담기
            </button>
            <button
              onClick={() => navigate('/checkout', { state: { directItem: buildCartItem() } })}
              className="h-12 flex-1 rounded bg-gray-900 text-base font-bold text-white transition-colors hover:bg-gray-800"
            >
              바로 구매하기
            </button>
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
