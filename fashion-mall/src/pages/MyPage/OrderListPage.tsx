import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrders } from '../../hooks/useOrders'
import type { OrderSummaryResponse, OrderSummaryItemResponse } from '../../types/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

type KoreanStatus = '결제대기' | '주문확인' | '결제완료' | '배송중' | '배송완료' | '취소'

function toKoreanStatus(status: string): KoreanStatus {
  if (status === 'PENDING') return '결제대기'
  if (status === 'CONFIRMED') return '주문확인'
  if (status === 'SHIPPING') return '배송중'
  if (status === 'DELIVERED') return '배송완료'
  if (status === 'CANCELLED') return '취소'
  return '결제완료' // PAID
}

/** ISO string → "2026. 2. 20" */
function fmtOrderDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`
}

/**숫자 → "89,000원" */
function fmtPrice(n: number): string {
  return n.toLocaleString('ko-KR') + '원'
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<KoreanStatus, { color: string; bg: string }> = {
  결제대기: { color: 'text-amber-700',   bg: 'bg-amber-50'   },
  주문확인: { color: 'text-gray-700',    bg: 'bg-gray-100'   },
  결제완료: { color: 'text-gray-700',    bg: 'bg-gray-100'   },
  배송중:   { color: 'text-blue-700',    bg: 'bg-blue-50'    },
  배송완료: { color: 'text-emerald-700', bg: 'bg-emerald-50' },
  취소:     { color: 'text-red-600',     bg: 'bg-red-50'     },
}

// ─── Period filter ────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = ['최근 6개월', '2026', '2025', '2024', '2023', '2022', '2021']

function filterByPeriod(orders: OrderSummaryResponse[], period: string): OrderSummaryResponse[] {
  if (period === '최근 6개월') {
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - 6)
    return orders.filter((o) => new Date(o.createdAt) >= cutoff)
  }
  const year = Number(period)
  return orders.filter((o) => new Date(o.createdAt).getFullYear() === year)
}

// ─── ItemRow ─────────────────────────────────────────────────────────────────

function ItemRow({ item }: { item: OrderSummaryItemResponse }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={item.imageUrl ?? `https://picsum.photos/seed/${item.productId}/400/600`}
        alt={item.productName}
        className="h-16 w-12 shrink-0 rounded object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{item.productName}</p>
        <p className="mt-1 text-xs text-gray-500">{fmtPrice(item.price)} · {item.quantity}개</p>
      </div>
      <span className="shrink-0 text-sm font-bold text-gray-900">
        {fmtPrice(item.price * item.quantity)}
      </span>
    </div>
  )
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: OrderSummaryResponse }) {
  const navigate = useNavigate()
  const korStatus = toKoreanStatus(order.status)
  const { color, bg } = STATUS_CFG[korStatus]

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">
            {fmtOrderDate(order.createdAt)} 주문
          </span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${color} ${bg}`}>
            {korStatus}
          </span>
        </div>
        <button
          onClick={() => navigate(`/mypage/orders/${order.id}`)}
          className="flex items-center gap-0.5 text-xs text-gray-400 transition-colors hover:text-gray-700"
        >
          주문 상세보기
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Item list */}
      <div className="flex flex-col divide-y divide-gray-100 px-5">
        {(order.items ?? []).map((item) => (
          <div key={item.productId} className="py-4">
            <ItemRow item={item} />
          </div>
        ))}
      </div>

      {/* Footer — total */}
      <div className="flex items-center justify-end border-t border-gray-100 px-5 py-3">
        <span className="text-xs text-gray-400 mr-2">총 결제금액</span>
        <span className="text-sm font-bold text-gray-900">{fmtPrice(order.totalPrice)}</span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderListPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('최근 6개월')
  const { orders, isLoading, error } = useOrders()

  const filtered = useMemo(() => filterByPeriod(orders, selectedPeriod), [orders, selectedPeriod])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">주문목록</h2>

      {/* Period chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        {PERIOD_OPTIONS.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPeriod(p)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedPeriod === p
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 text-gray-700 hover:border-gray-500'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Order list */}
      <div className="mt-6 flex flex-col gap-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-dashed border-red-200 bg-red-50 py-12 text-center">
            <p className="text-sm text-red-500">주문 내역을 불러오는 데 실패했습니다.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
            <svg className="mx-auto mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <p className="text-sm font-medium text-gray-400">주문 내역이 없어요</p>
            <p className="mt-1 text-xs text-gray-300">기간을 변경해보세요</p>
          </div>
        ) : (
          filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  )
}
