import { useParams, Link } from 'react-router-dom'
import { MOCK_ORDERS } from '../../mock/orders'

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const order = MOCK_ORDERS.find((o) => o.orderId === orderId)

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-gray-400">주문을 찾을 수 없습니다.</p>
        <Link to="/mypage/orders" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          주문목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/mypage/orders"
          className="flex items-center text-gray-400 transition-colors hover:text-gray-900"
          aria-label="주문목록으로"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-xl font-bold text-gray-900">주문 상세</h2>
      </div>

      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
        <p className="text-sm font-medium text-gray-400">주문 상세 페이지</p>
        <p className="mt-1 text-xs text-gray-300">{order.orderId}</p>
        <p className="mt-1 text-xs text-gray-300">— 준비 중 —</p>
      </div>
    </div>
  )
}
