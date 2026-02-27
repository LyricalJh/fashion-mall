import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import Container from '../components/ui/Container'
import { apiPost, ApiError } from '../lib/apiClient'
import { useStore } from '../store/useStore'

interface PaymentConfirmResponse {
  orderId: string
  status: string
}

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [errorCode, setErrorCode] = useState('')
  const confirmed = useRef(false)

  const paymentKey = searchParams.get('paymentKey')
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')

  useEffect(() => {
    if (confirmed.current) return
    if (!paymentKey || !orderId || !amount) {
      setStatus('error')
      setErrorMessage('결제 정보가 올바르지 않습니다.')
      return
    }
    confirmed.current = true

    // #6: 게스트 결제인 경우 confirm 호출을 건너뜀 (DB에 주문이 없으므로)
    const guestOrderData = sessionStorage.getItem('guest_order')
    if (guestOrderData) {
      try {
        const guestOrder = JSON.parse(guestOrderData)
        if (guestOrder.orderId === orderId && String(guestOrder.amount) === amount) {
          sessionStorage.removeItem('guest_order')
          // 게스트 장바구니 정리
          useStore.getState().clearCart()
          setStatus('success')
          return
        }
      } catch {
        // JSON 파싱 실패 시 정상 confirm 플로우로 진행
      }
    }

    const confirmPayment = async () => {
      try {
        await apiPost<PaymentConfirmResponse>('/payments/confirm', {
          paymentKey,
          orderId,
          amount: Number(amount),
        })
        setStatus('success')
      } catch (err) {
        setStatus('error')
        if (err instanceof ApiError) {
          setErrorMessage(err.message)
          setErrorCode(err.code)
        } else {
          setErrorMessage(err instanceof Error ? err.message : '결제 승인에 실패했습니다.')
        }
      }
    }

    confirmPayment()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'loading') {
    return (
      <Container className="py-20">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
            <svg className="h-8 w-8 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">결제 승인 중...</h1>
          <p className="mt-2 text-sm text-gray-500">잠시만 기다려 주세요.</p>
        </div>
      </Container>
    )
  }

  if (status === 'error') {
    return (
      <Container className="py-20">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
            <svg className="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">결제 승인 실패</h1>
          <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
          {errorCode === 'TOSS_PAYMENT_CONFIRM_FAILED' && (
            <p className="mt-1 text-xs text-gray-400">문제가 지속되면 고객센터로 문의해 주세요.</p>
          )}
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

  return (
    <Container className="py-20">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
          <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">결제가 완료되었습니다</h1>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2">
          <span className="text-xs text-gray-400">주문번호</span>
          <span className="text-sm font-semibold text-gray-900">{orderId}</span>
        </div>

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

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full rounded bg-gray-900 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-700"
          >
            쇼핑 계속하기
          </button>
          <Link
            to="/mypage/orders"
            className="w-full rounded border border-gray-200 py-3 text-center text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            주문 내역 보기
          </Link>
        </div>
      </div>
    </Container>
  )
}
