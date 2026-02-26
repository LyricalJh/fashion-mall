import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import Container from '../components/ui/Container'

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const code = searchParams.get('code') ?? 'UNKNOWN_ERROR'
  const message = searchParams.get('message') ?? '결제에 실패했습니다.'
  const orderId = searchParams.get('orderId')

  return (
    <Container className="py-20">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
          <svg className="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">결제에 실패했습니다</h1>

        <div className="mt-4 flex flex-col gap-1.5">
          <p className="text-sm text-gray-500">{message}</p>
          <p className="text-xs text-gray-400">오류 코드: {code}</p>
          {orderId && (
            <p className="text-xs text-gray-400">주문번호: {orderId}</p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full rounded bg-gray-900 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-700"
          >
            다시 시도하기
          </button>
          <Link
            to="/"
            className="w-full rounded border border-gray-200 py-3 text-center text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </Container>
  )
}
