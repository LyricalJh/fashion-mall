import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_ORDERS, type Order, type OrderItem, type OrderStatus } from '../../mock/orders'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

/** "YYYY-MM-DD" → local Date (avoid UTC offset issues) */
function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** "2026-02-20" → "2026. 2. 20" */
function fmtOrderDate(s: string): string {
  const [y, m, d] = s.split('-').map(Number)
  return `${y}. ${m}. ${d}`
}

/** "2026-02-21" → "2/21(토)" */
function fmtDeliveredDate(s: string): string {
  const dt = parseDate(s)
  return `${dt.getMonth() + 1}/${dt.getDate()}(${DAYS[dt.getDay()]})`
}

/** 숫자 → "89,000원" */
function fmtPrice(n: number): string {
  return n.toLocaleString('ko-KR') + '원'
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<OrderStatus, { color: string; bg: string }> = {
  배송완료: { color: 'text-emerald-700', bg: 'bg-emerald-50' },
  배송중:   { color: 'text-blue-700',    bg: 'bg-blue-50'    },
  결제완료: { color: 'text-gray-700',    bg: 'bg-gray-100'   },
  취소:     { color: 'text-red-600',     bg: 'bg-red-50'     },
  반품:     { color: 'text-orange-600',  bg: 'bg-orange-50'  },
  교환:     { color: 'text-purple-600',  bg: 'bg-purple-50'  },
}

/** 주문 상태에 따라 노출할 액션 버튼 */
function getActionButtons(status: OrderStatus): string[] {
  if (status === '배송완료') return ['배송 조회', '교환, 반품 신청', '리뷰 작성하기']
  if (status === '배송중')   return ['배송 조회']
  if (status === '결제완료') return ['배송 조회']
  if (status === '교환')     return ['교환 현황 조회']
  if (status === '반품')     return ['반품 현황 조회']
  return []
}

// ─── Period filter ────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = ['최근 6개월', '2026', '2025', '2024', '2023', '2022', '2021']

function filterByPeriod(orders: Order[], period: string): Order[] {
  if (period === '최근 6개월') {
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - 6)
    return orders.filter((o) => parseDate(o.orderedAt) >= cutoff)
  }
  const year = Number(period)
  return orders.filter((o) => parseDate(o.orderedAt).getFullYear() === year)
}

function filterByKeyword(orders: Order[], kw: string): Order[] {
  const lower = kw.trim().toLowerCase()
  if (!lower) return orders
  return orders.filter((o) =>
    o.items.some((it) => it.productName.toLowerCase().includes(lower))
  )
}

// ─── OrderItemRow ─────────────────────────────────────────────────────────────

function OrderItemRow({ item }: { item: OrderItem }) {
  return (
    <div className="flex items-start gap-3">
      {/* Thumbnail */}
      <img
        src={item.thumbnailUrl}
        alt={item.productName}
        className="h-16 w-16 shrink-0 rounded-lg object-cover sm:h-20 sm:w-16"
      />

      {/* Info */}
      <div className="min-w-0 flex-1">
        {item.brandBadge && (
          <span className="mb-1 inline-block rounded-sm bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            {item.brandBadge}
          </span>
        )}
        <p className="line-clamp-2 text-sm font-medium text-gray-900">{item.productName}</p>
        {item.optionText && (
          <p className="mt-0.5 text-xs text-gray-400">{item.optionText}</p>
        )}
        <p className="mt-1 text-sm font-semibold text-gray-800">
          {fmtPrice(item.price)}
          <span className="ml-1.5 font-normal text-gray-400">· {item.quantity}개</span>
        </p>
      </div>
    </div>
  )
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate()
  const { color, bg } = STATUS_CFG[order.status]
  const actionBtns = getActionButtons(order.status)
  const firstItem = order.items[0]
  const extraCount = order.items.length - 1

  function handleAction(label: string) {
    if (label.includes('배송')) {
      alert('배송조회는 준비 중입니다.')
    } else if (label.includes('교환') || label.includes('반품')) {
      alert('교환/반품 신청은 준비 중입니다.')
    } else if (label.includes('리뷰')) {
      alert('리뷰 작성은 준비 중입니다.')
    } else {
      alert('준비 중입니다.')
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <span className="text-sm font-semibold text-gray-800">
          {fmtOrderDate(order.orderedAt)} 주문
        </span>
        <button
          onClick={() => navigate(`/mypage/orders/${order.orderId}`)}
          className="flex items-center gap-0.5 text-xs text-gray-400 transition-colors hover:text-gray-700"
        >
          주문 상세보기
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Status row */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-3">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${color} ${bg}`}>
          {order.status}
        </span>
        {order.deliveredAt && (
          <span className="text-sm text-gray-500">
            · <span className="text-emerald-600">{fmtDeliveredDate(order.deliveredAt)} 도착</span>
          </span>
        )}
        {order.status === '배송중' && (
          <span className="text-sm text-blue-600">· 배송 중</span>
        )}
      </div>

      {/* Body: items (left) + action buttons (right) */}
      <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:gap-6">
        {/* Left: items */}
        <div className="min-w-0 flex-1 flex flex-col gap-3">
          <OrderItemRow item={firstItem} />

          {extraCount > 0 && (
            <button
              onClick={() => navigate(`/mypage/orders/${order.orderId}`)}
              className="self-start text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600"
            >
              외 {extraCount}개 더보기
            </button>
          )}
        </div>

        {/* Right: action buttons */}
        {actionBtns.length > 0 && (
          <div className="flex shrink-0 flex-row flex-wrap gap-2 sm:w-36 sm:flex-col sm:flex-nowrap">
            {actionBtns.map((label) => (
              <button
                key={label}
                onClick={() => handleAction(label)}
                className={`min-h-[40px] rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  label === '배송 조회' || label.includes('현황')
                    ? 'border-blue-500 text-blue-600 hover:bg-blue-50'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderListPage() {
  const [keyword, setKeyword] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('최근 6개월')

  const filtered = useMemo(() => {
    const byPeriod = filterByPeriod(MOCK_ORDERS, selectedPeriod)
    return filterByKeyword(byPeriod, keyword)
  }, [keyword, selectedPeriod])

  function handleSearch() {
    setKeyword(inputValue)
  }

  return (
    <div>
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900">주문목록</h2>

      {/* Search */}
      <div className="mt-5 flex items-center overflow-hidden rounded-xl border border-gray-300 bg-white transition-colors focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="주문한 상품을 검색할 수 있어요!"
          className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          aria-label="검색"
          className="flex h-full items-center justify-center px-4 text-gray-400 transition-colors hover:text-gray-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      </div>

      {/* Period chips */}
      <div className="mt-4 flex flex-wrap gap-2">
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
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
            <svg className="mx-auto mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <p className="text-sm font-medium text-gray-400">주문 내역이 없어요</p>
            <p className="mt-1 text-xs text-gray-300">검색어 또는 기간을 변경해보세요</p>
          </div>
        ) : (
          filtered.map((order) => (
            <OrderCard key={order.orderId} order={order} />
          ))
        )}
      </div>
    </div>
  )
}
