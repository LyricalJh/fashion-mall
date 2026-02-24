import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Container from '../components/ui/Container'
import { useStore } from '../store/useStore'
import type { CartItem } from '../types/cart'

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['01 옵션선택', '02 장바구니', '03 주문/결제', '04 주문완료'] as const
const ACTIVE_STEP = 2

const FREE_SHIPPING_THRESHOLD = 50_000
const SHIPPING_FEE = 3_000

const PAYMENT_METHODS = [
  { id: 'card',    label: '신용/체크카드' },
  { id: 'kakao',   label: '카카오페이' },
  { id: 'naver',   label: '네이버페이' },
  { id: 'bank',    label: '무통장 입금' },
] as const

const DELIVERY_MEMOS = [
  '배송 메모를 선택해 주세요',
  '부재 시 문 앞에 놓아주세요',
  '부재 시 경비실에 맡겨주세요',
  '부재 시 연락주세요',
  '직접 입력',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatKRW(n: number) {
  return n.toLocaleString('ko-KR') + '원'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator() {
  return (
    <ol className="hidden items-center justify-center gap-1 md:flex">
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
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-base font-bold text-gray-900 after:ml-1 after:text-rose-500 after:content-['*']">
      {children}
    </h2>
  )
}

function InputField({
  label, required, ...props
}: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-600">
        {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      <input
        className="rounded border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
        {...props}
      />
    </label>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartItems, clearCart } = useStore()

  // 바로 구매로 진입한 경우: 해당 상품만 결제 (장바구니 미사용)
  const directItem = (location.state as { directItem?: CartItem } | null)?.directItem

  const orderItems: CartItem[] = directItem
    ? [directItem]
    : cartItems.filter((it) => it.selected).length > 0
      ? cartItems.filter((it) => it.selected)
      : cartItems

  // Form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    postcode: '',
    address: '',
    addressDetail: '',
    deliveryMemo: DELIVERY_MEMOS[0],
  })
  const [customMemo, setCustomMemo] = useState('')
  const [payment, setPayment] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const totalPrice = orderItems.reduce((s, it) => s + it.price * it.quantity, 0)
  const shippingFee = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const finalPrice = totalPrice + shippingFee

  const field = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = () => {
    const errs: string[] = []
    if (!form.name.trim())    errs.push('수령인을 입력해 주세요.')
    if (!form.phone.trim())   errs.push('연락처를 입력해 주세요.')
    if (!form.address.trim()) errs.push('주소를 입력해 주세요.')
    if (!payment)             errs.push('결제 수단을 선택해 주세요.')
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    const orderNo = `STYLE-${Date.now().toString().slice(-8)}`
    // 바로 구매는 장바구니를 거치지 않았으므로 clearCart 하지 않음
    if (!directItem) clearCart()
    navigate('/order-complete', { state: { orderNo } })
  }

  return (
    <>
      <Container className="py-6 pb-28 md:pb-12">
        {/* Header */}
        <div className="border-b border-gray-200 pb-5">
          <div className="mb-5 flex items-center gap-3">
            <Link to="/cart" className="flex items-center text-gray-400 transition-colors hover:text-gray-900" aria-label="장바구니로 돌아가기">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">주문/결제</h1>
          </div>
          <StepIndicator />
        </div>

        {/* Main layout */}
        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">

          {/* ── Left column ── */}
          <div className="flex-1 flex flex-col gap-8">

            {/* 배송지 */}
            <section>
              <SectionHeading>배송지 정보</SectionHeading>
              <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField label="수령인" required placeholder="이름" value={form.name} onChange={field('name')} />
                  <InputField label="연락처" required placeholder="010-0000-0000" type="tel" value={form.phone} onChange={field('phone')} />
                </div>
                <div className="flex gap-2">
                  <InputField label="우편번호" placeholder="우편번호" value={form.postcode} onChange={field('postcode')} className="flex-1" />
                  <button className="mt-[22px] h-[42px] shrink-0 rounded border border-gray-900 px-4 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50">
                    검색
                  </button>
                </div>
                <InputField label="주소" required placeholder="기본 주소" value={form.address} onChange={field('address')} />
                <InputField label="상세주소" placeholder="상세 주소 입력" value={form.addressDetail} onChange={field('addressDetail')} />
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-gray-600">배송 메모</span>
                  <select
                    value={form.deliveryMemo}
                    onChange={field('deliveryMemo')}
                    className="rounded border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    {DELIVERY_MEMOS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                  {form.deliveryMemo === '직접 입력' && (
                    <textarea
                      value={customMemo}
                      onChange={(e) => setCustomMemo(e.target.value)}
                      placeholder="배송 메모를 입력해 주세요"
                      rows={2}
                      className="mt-1 rounded border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
                    />
                  )}
                </label>
              </div>
            </section>

            {/* 결제 수단 */}
            <section>
              <SectionHeading>결제 수단</SectionHeading>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPayment(m.id)}
                    className={`rounded-lg border py-3 text-sm font-medium transition-colors ${
                      payment === m.id
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Errors */}
            {errors.length > 0 && (
              <ul className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 space-y-1">
                {errors.map((e) => <li key={e}>• {e}</li>)}
              </ul>
            )}
          </div>

          {/* ── Right column — desktop order summary ── */}
          <div className="hidden w-80 shrink-0 lg:block lg:sticky lg:top-28">
            <OrderSummaryPanel
              orderItems={orderItems}
              totalPrice={totalPrice}
              shippingFee={shippingFee}
              finalPrice={finalPrice}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </Container>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">최종 결제금액</p>
            <p className="text-base font-bold text-gray-900">{formatKRW(finalPrice)}</p>
          </div>
          <button
            onClick={handleSubmit}
            className="shrink-0 rounded bg-gray-900 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-700"
          >
            결제하기
          </button>
        </div>
      </div>
    </>
  )
}

// ─── OrderSummaryPanel ────────────────────────────────────────────────────────

function OrderSummaryPanel({
  orderItems, totalPrice, shippingFee, finalPrice, onSubmit,
}: {
  orderItems: CartItem[]
  totalPrice: number
  shippingFee: number
  finalPrice: number
  onSubmit: () => void
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-5">
      <h2 className="font-bold text-gray-900">주문 상품</h2>

      {/* Item list */}
      <ul className="flex flex-col gap-3 border-b border-gray-100 pb-4">
        {orderItems.length === 0 ? (
          <li className="text-sm text-gray-400">상품이 없습니다.</li>
        ) : (
          orderItems.map((item) => (
            <li key={item.id} className="flex gap-3">
              <img src={item.imageUrl} alt={item.name} className="h-16 w-12 rounded object-cover" />
              <div className="flex flex-col justify-center gap-0.5 min-w-0">
                {item.brand && (
                  <p className="text-xs font-semibold uppercase text-gray-400">{item.brand}</p>
                )}
                <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                {item.optionText && (
                  <p className="text-xs text-gray-400">{item.optionText}</p>
                )}
                <p className="text-sm font-bold text-gray-900">
                  {(item.price * item.quantity).toLocaleString('ko-KR')}원
                  {item.quantity > 1 && (
                    <span className="ml-1 text-xs font-normal text-gray-400">×{item.quantity}</span>
                  )}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Price breakdown */}
      <div className="flex flex-col gap-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">총 상품 가격</span>
          <span className="text-gray-900">{formatKRW(totalPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">배송비</span>
          <span className={shippingFee === 0 ? 'font-medium text-emerald-600' : 'text-gray-900'}>
            {shippingFee === 0 ? '무료' : `+${formatKRW(shippingFee)}`}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <span className="text-sm font-bold text-gray-900">최종 결제금액</span>
        <span className="text-lg font-bold text-gray-900">{formatKRW(finalPrice)}</span>
      </div>

      <button
        onClick={onSubmit}
        className="w-full rounded bg-gray-900 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-700"
      >
        결제하기
      </button>
    </div>
  )
}
