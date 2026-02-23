import { useLocation, Link, useNavigate } from 'react-router-dom'
import Container from '../components/ui/Container'

const STEPS = ['01 옵션선택', '02 장바구니', '03 주문/결제', '04 주문완료'] as const
const ACTIVE_STEP = 3

export default function OrderCompletePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const orderNo: string = location.state?.orderNo ?? '-'

  return (
    <Container className="py-8">
      {/* Step indicator */}
      <ol className="hidden items-center justify-center gap-1 md:flex mb-12">
        {STEPS.map((step, i) => {
          const isActive = i === ACTIVE_STEP
          const isPast = i < ACTIVE_STEP
          return (
            <li key={step} className="flex items-center">
              <span
                className={`px-2 text-sm ${
                  isActive
                    ? 'font-bold text-gray-900 underline underline-offset-4'
                    : isPast
                    ? 'text-gray-400'
                    : 'text-gray-300'
                }`}
              >
                {step}
              </span>
              {i < STEPS.length - 1 && (
                <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </li>
          )
        })}
      </ol>

      {/* Content */}
      <div className="mx-auto max-w-md text-center">
        {/* Success icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
          <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">주문이 완료되었습니다</h1>

        {/* Order number */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2">
          <span className="text-xs text-gray-400">주문번호</span>
          <span className="text-sm font-semibold text-gray-900">{orderNo}</span>
        </div>

        {/* Info box */}
        <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 px-6 py-5 text-left">
          <ul className="flex flex-col gap-2.5 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="mt-0.5 text-gray-400">•</span>
              영업일 기준 2~3일 이내에 발송될 예정입니다.
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 text-gray-400">•</span>
              입력하신 연락처로 배송 안내 문자를 드립니다.
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 text-gray-400">•</span>
              교환·반품은 상품 수령 후 7일 이내에 가능합니다.
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full rounded bg-gray-900 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-700"
          >
            쇼핑 계속하기
          </button>
          <Link
            to="/cart"
            className="w-full rounded border border-gray-200 py-3 text-center text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            장바구니로 돌아가기
          </Link>
        </div>
      </div>
    </Container>
  )
}
