import { useState } from 'react'
import { useOrders } from '../../hooks/useOrders'
import { useInquiries } from '../../hooks/useInquiries'
import type { Inquiry, InquiryStatus, InquiryCategory } from '../../types/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(s: string): string {
  const date = new Date(s)
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`
}

function toKoreanStatus(status: InquiryStatus): string {
  if (status === 'PENDING') return '답변대기'
  if (status === 'ANSWERED') return '답변완료'
  return '종료'
}

function toKoreanCategory(category: InquiryCategory): string {
  if (category === 'PRODUCT') return '상품문의'
  if (category === 'DELIVERY') return '배송문의'
  if (category === 'EXCHANGE_RETURN') return '반품문의'
  if (category === 'PAYMENT') return '결제문의'
  return '기타'
}

const STATUS_STYLES: Record<InquiryStatus, { badge: string }> = {
  PENDING: { badge: 'bg-amber-50 text-amber-600' },
  ANSWERED: { badge: 'bg-emerald-50 text-emerald-600' },
  CLOSED: { badge: 'bg-gray-100 text-gray-500' },
}

const CATEGORY_OPTIONS: { value: InquiryCategory; label: string }[] = [
  { value: 'PRODUCT', label: '상품문의' },
  { value: 'DELIVERY', label: '배송문의' },
  { value: 'EXCHANGE_RETURN', label: '반품문의' },
  { value: 'PAYMENT', label: '결제문의' },
  { value: 'OTHER', label: '기타' },
]

// ─── InquiryCard ──────────────────────────────────────────────────────────────

function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const [open, setOpen] = useState(false)
  const statusStyle = STATUS_STYLES[inquiry.status]

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Header (clickable) */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusStyle.badge}`}>
          {toKoreanStatus(inquiry.status)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">{toKoreanCategory(inquiry.category)}</span>
            {inquiry.orderProductName && (
              <>
                <span className="h-3 w-px bg-gray-200" />
                <span className="truncate text-xs text-gray-400">{inquiry.orderProductName}</span>
              </>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">{inquiry.title}</p>
        </div>
        <span className="shrink-0 text-xs text-gray-400">{fmtDate(inquiry.createdAt)}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expandable body */}
      {open && (
        <div className="border-t border-gray-100">
          {/* Question */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600">Q</span>
              <span className="text-xs font-medium text-gray-500">문의 내용</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{inquiry.content}</p>
          </div>

          {/* Answer */}
          {inquiry.answer && (
            <div className="border-t border-gray-100 bg-blue-50/40 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">A</span>
                <span className="text-xs font-medium text-gray-500">
                  답변 <span className="text-gray-400">({fmtDate(inquiry.answeredAt!)})</span>
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{inquiry.answer}</p>
            </div>
          )}

          {/* No answer yet */}
          {!inquiry.answer && (
            <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
              <p className="text-center text-sm text-gray-400">답변을 준비 중입니다. 잠시만 기다려주세요.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── InquiryForm ──────────────────────────────────────────────────────────────

function InquiryForm({ submitInquiry }: {
  submitInquiry: (data: { category: InquiryCategory; orderId?: number; title: string; content: string }) => Promise<void>
}) {
  const { orders } = useOrders()

  const [category, setCategory] = useState<InquiryCategory>('PRODUCT')
  const [orderId, setOrderId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = title.trim().length > 0 && content.trim().length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)

    try {
      await submitInquiry({
        category,
        orderId: orderId ? Number(orderId) : undefined,
        title,
        content,
      })
      alert('문의가 등록되었습니다.')
      setCategory('PRODUCT')
      setOrderId('')
      setTitle('')
      setContent('')
    } catch {
      alert('문의 등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-base font-bold text-gray-900">문의 작성</h3>

      <div className="mt-5 space-y-4">
        {/* Category */}
        <div>
          <label htmlFor="inq-category" className="block text-sm font-medium text-gray-700">
            문의 유형
          </label>
          <select
            id="inq-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as InquiryCategory)}
            className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Order select */}
        <div>
          <label htmlFor="inq-order" className="block text-sm font-medium text-gray-700">
            관련 주문 <span className="font-normal text-gray-400">(선택)</span>
          </label>
          <select
            id="inq-order"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          >
            <option value="">주문을 선택하세요</option>
            {orders.map((order) => {
              const firstItem = order.items?.[0]
              const label = firstItem
                ? `${firstItem.productName}${order.itemCount > 1 ? ` 외 ${order.itemCount - 1}건` : ''}`
                : `주문 #${order.id}`
              const date = new Date(order.createdAt)
              const dateStr = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
              return (
                <option key={order.id} value={order.id}>
                  [{dateStr}] {label} ({order.totalPrice.toLocaleString('ko-KR')}원)
                </option>
              )
            })}
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="inq-title" className="block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            id="inq-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문의 제목을 입력하세요"
            maxLength={100}
            className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="inq-content" className="block text-sm font-medium text-gray-700">
            문의 내용
          </label>
          <textarea
            id="inq-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="문의하실 내용을 자세히 입력해주세요"
            rows={5}
            maxLength={2000}
            className="mt-1.5 block w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <p className="mt-1 text-right text-xs text-gray-400">{content.length}/2000</p>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {submitting ? '등록 중...' : '문의 등록'}
        </button>
      </div>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InquiryPage() {
  const { inquiries, isLoading, error, submitInquiry } = useInquiries()

  const waitingCount = inquiries.filter((i) => i.status === 'PENDING').length

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-dashed border-red-200 bg-red-50 py-12 text-center">
        <p className="text-sm text-red-500">문의 내역을 불러오는 데 실패했습니다.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-bold text-gray-900">문의하기</h2>
        {inquiries.length > 0 && (
          <p className="text-sm text-gray-500">
            답변대기 <span className="font-bold text-amber-600">{waitingCount}</span>건
          </p>
        )}
      </div>

      {/* Inquiry list */}
      <div className="mt-6 flex flex-col gap-3">
        {inquiries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
            <svg
              className="mx-auto mb-3 h-10 w-10 text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-sm font-medium text-gray-400">접수된 문의가 없습니다.</p>
            <p className="mt-1 text-xs text-gray-300">아래 폼에서 문의를 등록해보세요.</p>
          </div>
        ) : (
          inquiries.map((inquiry) => <InquiryCard key={inquiry.id} inquiry={inquiry} />)
        )}
      </div>

      {/* Divider */}
      <div className="my-8 border-t border-gray-200" />

      {/* Inquiry form */}
      <InquiryForm submitInquiry={submitInquiry} />

      {/* Info note */}
      <div className="mt-6 rounded-xl bg-gray-50 px-4 py-3.5">
        <p className="text-xs font-semibold text-gray-500">문의 안내</p>
        <ul className="mt-2 space-y-1 text-xs leading-relaxed text-gray-400">
          <li>- 영업일 기준 1~2일 이내에 답변을 드립니다.</li>
          <li>- 주말 및 공휴일에는 답변이 지연될 수 있습니다.</li>
          <li>- 주문 관련 문의는 관련 주문을 선택하면 빠른 처리가 가능합니다.</li>
        </ul>
      </div>
    </div>
  )
}
