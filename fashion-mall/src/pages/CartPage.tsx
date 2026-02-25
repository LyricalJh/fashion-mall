import { useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../components/ui/Container'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/authStore'
import { useCart } from '../hooks/useCart'
import type { CartItem } from '../types/cart'
import type { CartItemResponse } from '../types/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const FREE_SHIPPING_THRESHOLD = 50_000
const SHIPPING_FEE = 3_000

const STEPS = ['01 옵션선택', '02 장바구니', '03 주문/결제', '04 주문완료'] as const
const ACTIVE_STEP = 1

// ─── Adapter ──────────────────────────────────────────────────────────────────

function toCartItem(item: CartItemResponse, selected: boolean): CartItem {
  return {
    id: `${item.productId}`,
    name: item.productName,
    imageUrl: item.imageUrl ?? `https://picsum.photos/seed/${item.productId}/400/600`,
    price: item.productPrice,
    quantity: item.quantity,
    selected,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatKRW(n: number) {
  return n.toLocaleString('ko-KR') + '원'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CartHeader({ count }: { count: number }) {
  return (
    <div className="border-b border-gray-200 pb-5">
      <div className="mb-5 flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center text-gray-400 transition-colors hover:text-gray-900"
          aria-label="홈으로 돌아가기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">장바구니({count})</h1>
      </div>

      <ol className="hidden items-center justify-center gap-1 md:flex">
        {STEPS.map((step, i) => {
          const isActive = i === ACTIVE_STEP
          const isPast = i < ACTIVE_STEP
          return (
            <li key={step} className="flex items-center">
              <span className={`px-2 text-sm ${isActive ? 'font-bold text-gray-900 underline underline-offset-4' : isPast ? 'text-gray-400' : 'text-gray-300'}`}>
                {step}
              </span>
              {i < STEPS.length - 1 && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function QuantityStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center rounded border border-gray-300">
      <button onClick={() => onChange(Math.max(1, value - 1))} className="flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50" aria-label="수량 감소">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </button>
      <span className="flex h-8 w-9 items-center justify-center border-x border-gray-300 text-sm font-medium text-gray-900">{value}</span>
      <button onClick={() => onChange(value + 1)} className="flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50" aria-label="수량 증가">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}

function CartItemRow({ item, onToggle, onQuantity, onDelete }: { item: CartItem; onToggle: () => void; onQuantity: (v: number) => void; onDelete: () => void }) {
  return (
    <div className="flex gap-3 border-b border-gray-100 py-4 last:border-b-0">
      <input type="checkbox" checked={item.selected} onChange={onToggle} className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-gray-900" aria-label={`${item.name} 선택`} />
      <Link to={`/product/${item.id.split('-')[0]}`} className="shrink-0">
        <img src={item.imageUrl} alt={item.name} className="h-24 w-20 rounded object-cover" loading="lazy" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {item.brand && <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{item.brand}</p>}
            <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
            {item.optionText && <p className="mt-0.5 text-xs text-gray-400">{item.optionText}</p>}
          </div>
          <button onClick={onDelete} className="shrink-0 text-gray-300 transition-colors hover:text-gray-600" aria-label={`${item.name} 삭제`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-baseline gap-1.5">
          {item.discountRate && <span className="text-xs font-bold text-rose-600">{item.discountRate}%</span>}
          <span className="text-sm font-bold text-gray-900">{formatKRW(item.price * item.quantity)}</span>
          {item.originalPrice && <span className="text-xs text-gray-400 line-through">{formatKRW(item.originalPrice)}</span>}
        </div>
        <div className="mt-1 flex items-center justify-between">
          {item.deliveryText ? <p className="text-xs text-gray-500">{item.deliveryText}</p> : <span />}
          <QuantityStepper value={item.quantity} onChange={onQuantity} />
        </div>
      </div>
    </div>
  )
}

function CartSelectionBar({ allSelected, selectedCount, onToggleAll, onDeleteSelected }: { allSelected: boolean; selectedCount: number; onToggleAll: () => void; onDeleteSelected: () => void }) {
  return (
    <div className="flex items-center gap-4 border-b border-gray-200 py-3">
      <label className="flex cursor-pointer select-none items-center gap-2">
        <input type="checkbox" checked={allSelected} onChange={onToggleAll} className="h-4 w-4 accent-gray-900" />
        <span className="text-sm text-gray-700">전체선택</span>
      </label>
      <span className="text-gray-200">|</span>
      <button onClick={onDeleteSelected} disabled={selectedCount === 0} className="text-sm text-gray-500 transition-colors hover:text-gray-900 disabled:opacity-30">선택삭제</button>
      <span className="text-gray-200">|</span>
      <button disabled className="cursor-not-allowed text-sm text-gray-300">품절/종료상품 삭제</button>
    </div>
  )
}

function OrderSummaryPanel({ totalPrice, shippingFee, finalPrice }: { totalPrice: number; shippingFee: number; finalPrice: number }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-5">
      <h2 className="font-bold text-gray-900">주문 금액</h2>
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">총 상품 가격</span>
          <span className="text-gray-900">{formatKRW(totalPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">배송비</span>
          <span className={shippingFee === 0 ? 'font-medium text-emerald-600' : 'text-gray-900'}>{shippingFee === 0 ? '무료' : `+${formatKRW(shippingFee)}`}</span>
        </div>
        {shippingFee > 0 && <p className="text-xs text-gray-400">{formatKRW(FREE_SHIPPING_THRESHOLD - totalPrice)} 더 담으면 무료배송</p>}
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <span className="text-sm font-bold text-gray-900">최종 결제금액</span>
        <span className="text-lg font-bold text-gray-900">{formatKRW(finalPrice)}</span>
      </div>
      <Link to="/checkout" className="block rounded bg-gray-900 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-gray-700">구매하기</Link>
    </div>
  )
}

function MobileCheckoutBar({ finalPrice }: { finalPrice: number }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 py-3 md:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500">최종 결제금액</p>
          <p className="text-base font-bold text-gray-900">{formatKRW(finalPrice)}</p>
        </div>
        <Link to="/checkout" className="shrink-0 rounded bg-gray-900 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-700">구매하기</Link>
      </div>
    </div>
  )
}

// ─── API Cart (logged-in) ──────────────────────────────────────────────────────

function ApiCartView() {
  const { cart, isLoading, updateItem, removeItem } = useCart()
  const apiItems = cart?.items ?? []
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set(apiItems.map((i) => i.id)))

  // Sync selected set when new items arrive (e.g. after initial load)
  const allItemIds = apiItems.map((i) => i.id)
  const cartItems: CartItem[] = apiItems.map((item) => toCartItem(item, selectedIds.has(item.id)))

  const allSelected = apiItems.length > 0 && apiItems.every((i) => selectedIds.has(i.id))
  const selectedItems = cartItems.filter((it) => it.selected)
  const totalPrice = selectedItems.reduce((sum, it) => sum + it.price * it.quantity, 0)
  const shippingFee = totalPrice === 0 ? 0 : totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const finalPrice = totalPrice + shippingFee

  function toggleSelect(apiId: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(apiId)) next.delete(apiId)
      else next.add(apiId)
      return next
    })
  }

  function toggleSelectAll(selectAll: boolean) {
    setSelectedIds(selectAll ? new Set(allItemIds) : new Set())
  }

  async function deleteSelected() {
    const toDelete = apiItems.filter((i) => selectedIds.has(i.id))
    await Promise.all(toDelete.map((i) => removeItem(i.id)))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      toDelete.forEach((i) => next.delete(i.id))
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  return (
    <>
      <Container className="py-6 pb-28 md:pb-12">
        <CartHeader count={apiItems.length} />

        {apiItems.length === 0 ? (
          <div className="py-24 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-12 w-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
            <p className="text-gray-400">장바구니가 비어있습니다.</p>
            <Link to="/" className="mt-4 inline-block text-sm text-rose-600 hover:underline">쇼핑 계속하기</Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
            <div className="min-w-0 flex-1">
              <CartSelectionBar
                allSelected={allSelected}
                selectedCount={selectedItems.length}
                onToggleAll={() => toggleSelectAll(!allSelected)}
                onDeleteSelected={deleteSelected}
              />
              <div>
                {apiItems.map((apiItem) => (
                  <CartItemRow
                    key={apiItem.id}
                    item={toCartItem(apiItem, selectedIds.has(apiItem.id))}
                    onToggle={() => toggleSelect(apiItem.id)}
                    onQuantity={(v) => updateItem(apiItem.id, v)}
                    onDelete={() => removeItem(apiItem.id)}
                  />
                ))}
              </div>
            </div>
            <div className="hidden w-72 shrink-0 md:block lg:sticky lg:top-28">
              <OrderSummaryPanel totalPrice={totalPrice} shippingFee={shippingFee} finalPrice={finalPrice} />
            </div>
          </div>
        )}
      </Container>
      {apiItems.length > 0 && <MobileCheckoutBar finalPrice={finalPrice} />}
    </>
  )
}

// ─── Local Cart (guest) ────────────────────────────────────────────────────────

function LocalCartView() {
  const { cartItems, toggleSelect, toggleSelectAll, deleteSelected, removeFromCart, updateQuantity } = useStore()

  const allSelected = cartItems.length > 0 && cartItems.every((it) => it.selected)
  const selectedItems = cartItems.filter((it) => it.selected)
  const totalPrice = selectedItems.reduce((sum, it) => sum + it.price * it.quantity, 0)
  const shippingFee = totalPrice === 0 ? 0 : totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const finalPrice = totalPrice + shippingFee

  return (
    <>
      <Container className="py-6 pb-28 md:pb-12">
        <CartHeader count={cartItems.length} />

        {cartItems.length === 0 ? (
          <div className="py-24 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-12 w-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
            <p className="text-gray-400">장바구니가 비어있습니다.</p>
            <Link to="/" className="mt-4 inline-block text-sm text-rose-600 hover:underline">쇼핑 계속하기</Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
            <div className="min-w-0 flex-1">
              <CartSelectionBar
                allSelected={allSelected}
                selectedCount={selectedItems.length}
                onToggleAll={() => toggleSelectAll(!allSelected)}
                onDeleteSelected={deleteSelected}
              />
              <div>
                {cartItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onToggle={() => toggleSelect(item.id)}
                    onQuantity={(v) => updateQuantity(item.id, v)}
                    onDelete={() => removeFromCart(item.id)}
                  />
                ))}
              </div>
            </div>
            <div className="hidden w-72 shrink-0 md:block lg:sticky lg:top-28">
              <OrderSummaryPanel totalPrice={totalPrice} shippingFee={shippingFee} finalPrice={finalPrice} />
            </div>
          </div>
        )}
      </Container>
      {cartItems.length > 0 && <MobileCheckoutBar finalPrice={finalPrice} />}
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CartPage() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  return isLoggedIn ? <ApiCartView /> : <LocalCartView />
}
