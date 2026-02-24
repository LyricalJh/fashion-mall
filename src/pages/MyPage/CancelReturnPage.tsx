import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  MOCK_CLAIMS,
  MOCK_BANK_REFUNDS,
  type Claim,
  type ClaimType,
  type ClaimStatus,
  type BankRefund,
  type BankRefundStatus,
} from '../../mock/claims'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "YYYY-MM-DD" → "YYYY/M/D" */
function fmtDate(s: string): string {
  const [y, m, d] = s.split('-').map(Number)
  return `${y}/${m}/${d}`
}

/** 숫자 → "59,000원" */
function fmtPrice(n: number): string {
  return n.toLocaleString('ko-KR') + '원'
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function getClaimStatusLabel(claimType: ClaimType, status: ClaimStatus): string {
  if (status === '취소완료') return '취소완료'
  if (status === '환불완료') return claimType === '반품' ? '반품완료' : '환불완료'
  if (status === '교환완료') return '교환완료'
  if (status === '접수')    return `${claimType} 접수`
  if (status === '처리중')  return `${claimType} 처리중`
  if (status === '회수중')  return '회수 진행중'
  if (status === '회수완료') return '회수완료'
  if (status === '불가')    return '처리 불가'
  return status
}

const CLAIM_STATUS_COLOR: Record<ClaimStatus, string> = {
  환불완료: 'text-emerald-600',
  교환완료: 'text-emerald-600',
  취소완료: 'text-emerald-600',
  회수완료: 'text-emerald-600',
  접수:     'text-blue-600',
  처리중:   'text-blue-600',
  회수중:   'text-orange-500',
  불가:     'text-red-600',
}

const BANK_STATUS_COLOR: Record<BankRefundStatus, string> = {
  환불완료: 'text-emerald-600',
  접수:     'text-blue-600',
  처리중:   'text-blue-600',
  불가:     'text-red-600',
}

// ─── ClaimCard ────────────────────────────────────────────────────────────────

function ClaimCard({ claim }: { claim: Claim }) {
  const navigate = useNavigate()
  const item = claim.items[0]
  const statusLabel = getClaimStatusLabel(claim.claimType, claim.status)
  const statusColor = CLAIM_STATUS_COLOR[claim.status]

  const detailLabel = `${claim.claimType}상세`
  const showPickupBtn = claim.claimType === '반품' || claim.claimType === '교환'

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-gray-50 px-4 py-3 text-xs text-gray-600">
        <span>
          <span className="font-medium text-gray-500">{claim.claimType}접수일</span>
          {' : '}
          {fmtDate(claim.receivedAt)}
        </span>
        <span className="hidden h-3 w-px bg-gray-300 sm:block" aria-hidden="true" />
        <span>
          <span className="font-medium text-gray-500">주문일</span>
          {' : '}
          {fmtDate(claim.orderedAt)}
        </span>
        <span className="hidden h-3 w-px bg-gray-300 sm:block" aria-hidden="true" />
        <span>
          <span className="font-medium text-gray-500">주문번호</span>
          {' : '}
          {claim.orderNo}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        {/* Desktop: 3-col | Mobile: stacked */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-4">

          {/* Left — product info */}
          <div className="flex min-w-0 flex-1 gap-3">
            <img
              src={item.thumbnailUrl}
              alt={item.productName}
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 line-clamp-2">{item.productName}</p>
              {item.productDesc && (
                <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{item.productDesc}</p>
              )}
              {/* Mobile only: qty · price */}
              <p className="mt-1.5 text-sm text-gray-700 md:hidden">
                {item.quantity}개
                <span className="mx-1.5 text-gray-300">·</span>
                <span className="font-semibold">{fmtPrice(item.price)}</span>
              </p>
            </div>
          </div>

          {/* Center — qty/price (desktop only) */}
          <div className="hidden w-28 shrink-0 flex-col items-end gap-1 pt-0.5 md:flex">
            <span className="text-sm text-gray-600">{item.quantity}개</span>
            <span className="text-sm font-bold text-gray-900">{fmtPrice(item.price)}</span>
          </div>

          {/* Right — status + buttons */}
          <div className="flex items-center justify-between gap-3 md:w-40 md:shrink-0 md:flex-col md:items-end md:pt-0.5">
            {/* Status info */}
            <div className="flex flex-col gap-0.5 md:items-end">
              <span className={`text-sm font-bold ${statusColor}`}>{statusLabel}</span>
              {claim.completeDueText && (
                <span className="text-xs text-gray-500">{claim.completeDueText}</span>
              )}
              {claim.paymentMethod && (
                <span className="text-xs text-gray-400">{claim.paymentMethod}</span>
              )}
              {claim.note && (
                <span className="text-xs text-gray-400">{claim.note}</span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-row gap-2 md:flex-col">
              <button
                onClick={() => navigate(`/mypage/returns/${claim.claimId}`)}
                className="min-h-[36px] rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
              >
                {detailLabel}
              </button>
              {showPickupBtn && (
                <button
                  onClick={() => alert('회수조회는 준비 중입니다.')}
                  className="min-h-[36px] rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  회수조회
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── BankRefundCard ───────────────────────────────────────────────────────────

function BankRefundCard({ refund }: { refund: BankRefund }) {
  const statusColor = BANK_STATUS_COLOR[refund.status]

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-gray-50 px-4 py-3 text-xs text-gray-600">
        <span>
          <span className="font-medium text-gray-500">신청일</span>
          {' : '}
          {fmtDate(refund.requestedAt)}
        </span>
        {refund.orderNo && (
          <>
            <span className="hidden h-3 w-px bg-gray-300 sm:block" aria-hidden="true" />
            <span>
              <span className="font-medium text-gray-500">주문번호</span>
              {' : '}
              {refund.orderNo}
            </span>
          </>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">

          {/* Left — account info */}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">무통장 환불 신청</p>
            {refund.accountMasked && (
              <p className="mt-0.5 text-sm text-gray-500">{refund.accountMasked}</p>
            )}
            {refund.memo && (
              <p className="mt-0.5 text-xs text-gray-400">{refund.memo}</p>
            )}
            {/* Mobile: amount */}
            <p className="mt-1.5 text-sm font-bold text-gray-900 md:hidden">
              {fmtPrice(refund.amount)}
            </p>
          </div>

          {/* Center — amount (desktop only) */}
          <div className="hidden w-28 shrink-0 text-right md:block">
            <span className="text-sm font-bold text-gray-900">{fmtPrice(refund.amount)}</span>
          </div>

          {/* Right — status + button */}
          <div className="flex items-center justify-between gap-3 md:w-40 md:shrink-0 md:flex-col md:items-end">
            <span className={`text-sm font-bold ${statusColor}`}>{refund.status}</span>
            <button
              onClick={() => alert('무통장환불 상세는 준비 중입니다.')}
              className="min-h-[36px] rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
            >
              상세보기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
      <svg
        className="mx-auto mb-3 h-10 w-10 text-gray-300"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
      </svg>
      <p className="text-sm font-medium text-gray-400">{label}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type TabKey = 'claim' | 'bank'

export default function CancelReturnPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') ?? 'claim') as TabKey

  function setTab(t: TabKey) {
    setSearchParams({ tab: t })
  }

  return (
    <div>
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900">취소/반품/교환/환불 내역</h2>

      {/* Tabs */}
      <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-xl border border-gray-200">
        {(
          [
            { key: 'claim', label: '취소/반품/교환' },
            { key: 'bank',  label: '무통장환불' },
          ] as { key: TabKey; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`py-3.5 text-center text-sm font-medium transition-colors ${
              tab === key
                ? 'border-t-2 border-blue-600 bg-white text-blue-600'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Notice bar */}
      <div className="mt-4 flex flex-col gap-3 rounded-xl bg-gray-50 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1 text-xs leading-relaxed text-gray-600">
          <p>취소/반품/교환 신청한 내역을 확인할 수 있습니다.</p>
          <p>
            하단 상품목록에 없는 상품은 1:1문의 또는{' '}
            <a
              href="tel:15777011"
              className="font-medium underline underline-offset-2 hover:text-gray-900"
            >
              고객센터(1577-7011)
            </a>
            로 문의하세요.
          </p>
        </div>
        <button
          onClick={() => alert('취소/반품 안내 페이지는 준비 중입니다.')}
          className="shrink-0 self-start whitespace-nowrap text-xs font-medium text-blue-600 hover:underline"
        >
          취소/반품 안내 &gt;
        </button>
      </div>

      {/* List */}
      <div className="mt-6 flex flex-col gap-4">
        {tab === 'claim' ? (
          MOCK_CLAIMS.length === 0 ? (
            <EmptyState label="취소/반품/교환 내역이 없습니다." />
          ) : (
            MOCK_CLAIMS.map((claim) => (
              <ClaimCard key={claim.claimId} claim={claim} />
            ))
          )
        ) : (
          MOCK_BANK_REFUNDS.length === 0 ? (
            <EmptyState label="무통장환불 내역이 없습니다." />
          ) : (
            MOCK_BANK_REFUNDS.map((refund) => (
              <BankRefundCard key={refund.refundId} refund={refund} />
            ))
          )
        )}
      </div>
    </div>
  )
}
