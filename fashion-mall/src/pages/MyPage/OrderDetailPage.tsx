import { useParams, Link } from 'react-router-dom'
import { useOrder, cancelOrder } from '../../hooks/useOrders'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toKoreanStatus(status: string): string {
  if (status === 'SHIPPING') return '배송중'
  if (status === 'DELIVERED') return '배송완료'
  if (status === 'CANCELLED') return '취소'
  return '결제완료' // PENDING | PAID
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`
}

function fmtPrice(n: number): string {
  return n.toLocaleString('ko-KR') + '원'
}

const STATUS_COLOR: Record<string, string> = {
  배송완료: 'text-emerald-700 bg-emerald-50',
  배송중:   'text-blue-700 bg-blue-50',
  결제완료: 'text-gray-700 bg-gray-100',
  취소:     'text-red-600 bg-red-50',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const id = orderId ? parseInt(orderId, 10) : null
  const { order, isLoading, error } = useOrder(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-gray-400">주문을 찾을 수 없습니다.</p>
        <Link to="/mypage/orders" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          주문목록으로 돌아가기
        </Link>
      </div>
    )
  }

  const korStatus = toKoreanStatus(order.status)
  const statusColor = STATUS_COLOR[korStatus] ?? 'text-gray-700 bg-gray-100'
  const canCancel = order.status === 'PENDING' || order.status === 'PAID'

  async function handleCancel() {
    if (!window.confirm('주문을 취소하시겠습니까?')) return
    try {
      await cancelOrder(order!.id)
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : '취소 처리에 실패했습니다.')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link to="/mypage/orders" className="flex items-center text-gray-400 transition-colors hover:text-gray-900" aria-label="주문목록으로">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-xl font-bold text-gray-900">주문 상세</h2>
      </div>

      <div className="flex flex-col gap-5">
        {/* Order info */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">주문번호</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900">#{order.id}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor}`}>{korStatus}</span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>주문일: {fmtDate(order.createdAt)}</span>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-gray-900">주문 상품</h3>
          <ul className="flex flex-col gap-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <img
                  src={`https://picsum.photos/seed/${item.productId}/400/600`}
                  alt={item.productName}
                  className="h-16 w-12 shrink-0 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.productName}</p>
                  <p className="mt-1 text-xs text-gray-400">{item.quantity}개</p>
                  <p className="mt-1 text-sm font-bold text-gray-900">{fmtPrice(item.priceAtOrder * item.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Shipping info */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-gray-900">배송 정보</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500">수령인</dt>
            <dd className="text-gray-900">{order.receiverName}</dd>
            <dt className="text-gray-500">연락처</dt>
            <dd className="text-gray-900">{order.receiverPhone}</dd>
            <dt className="text-gray-500">배송지</dt>
            <dd className="text-gray-900">{order.shippingAddress}</dd>
          </dl>
        </div>

        {/* Price summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">총 결제금액</span>
            <span className="text-lg font-bold text-gray-900">{fmtPrice(order.totalPrice)}</span>
          </div>
        </div>

        {/* Cancel button */}
        {canCancel && (
          <button
            onClick={handleCancel}
            className="w-full rounded-xl border border-red-300 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            주문 취소
          </button>
        )}
      </div>
    </div>
  )
}
