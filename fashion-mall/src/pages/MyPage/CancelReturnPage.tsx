import { useNavigate } from 'react-router-dom'
import { useClaims } from '../../hooks/useClaims'
import type { ClaimSummaryResponse, ClaimType, ClaimStatus } from '../../types/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

function fmtPrice(n: number): string {
  return n.toLocaleString('ko-KR') + '원'
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function getClaimStatusLabel(claimType: ClaimType, status: ClaimStatus): string {
  if (status === 'COMPLETED') {
    return claimType === 'CANCEL' ? '취소완료' : '환불완료'
  }
  const typeLabel = claimType === 'CANCEL' ? '취소' : '반품'
  const map: Record<ClaimStatus, string> = {
    RECEIVED: `${typeLabel} 접수`,
    PROCESSING: `${typeLabel} 처리중`,
    PICKUP: '회수 진행중',
    PICKED_UP: '회수완료',
    COMPLETED: '완료',
    REJECTED: '처리 불가',
  }
  return map[status] ?? status
}

function getStatusColor(status: ClaimStatus): string {
  switch (status) {
    case 'COMPLETED':
    case 'PICKED_UP':
      return 'text-emerald-600'
    case 'RECEIVED':
    case 'PROCESSING':
      return 'text-blue-600'
    case 'PICKUP':
      return 'text-orange-500'
    case 'REJECTED':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

// ─── ClaimCard ────────────────────────────────────────────────────────────────

function ClaimCard({ claim }: { claim: ClaimSummaryResponse }) {
  const navigate = useNavigate()
  const statusLabel = getClaimStatusLabel(claim.claimType, claim.status)
  const statusColor = getStatusColor(claim.status)
  const typeLabel = claim.claimType === 'CANCEL' ? '취소' : '반품'
  const showPickupBtn = claim.claimType === 'RETURN'

  const displayName = claim.firstProductName
    ? claim.itemCount > 1
      ? `${claim.firstProductName} 외 ${claim.itemCount - 1}건`
      : claim.firstProductName
    : '상품 정보 없음'

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-gray-50 px-4 py-3 text-xs text-gray-600">
        <span>
          <span className="font-medium text-gray-500">{typeLabel}접수일</span>
          {' : '}
          {fmtDate(claim.createdAt)}
        </span>
        <span className="hidden h-3 w-px bg-gray-300 sm:block" aria-hidden="true" />
        <span>
          <span className="font-medium text-gray-500">주문번호</span>
          {' : '}
          {claim.orderNumber}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-4">
          {/* Left — product info */}
          <div className="flex min-w-0 flex-1 gap-3">
            {claim.firstProductImageUrl ? (
              <img
                src={claim.firstProductImageUrl}
                alt={claim.firstProductName ?? ''}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 line-clamp-2">{displayName}</p>
              {/* Mobile only: qty · price */}
              <p className="mt-1.5 text-sm text-gray-700 md:hidden">
                {claim.firstItemQuantity}개
                {claim.firstItemPrice != null && (
                  <>
                    <span className="mx-1.5 text-gray-300">·</span>
                    <span className="font-semibold">{fmtPrice(claim.firstItemPrice)}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Center — qty/price (desktop only) */}
          <div className="hidden w-28 shrink-0 flex-col items-end gap-1 pt-0.5 md:flex">
            <span className="text-sm text-gray-600">{claim.firstItemQuantity}개</span>
            {claim.refundAmount != null && (
              <span className="text-sm font-bold text-gray-900">{fmtPrice(claim.refundAmount)}</span>
            )}
          </div>

          {/* Right — status + buttons */}
          <div className="flex items-center justify-between gap-3 md:w-40 md:shrink-0 md:flex-col md:items-end md:pt-0.5">
            <span className={`text-sm font-bold ${statusColor}`}>{statusLabel}</span>

            <div className="flex flex-row gap-2 md:flex-col">
              <button
                onClick={() => navigate(`/mypage/returns/${claim.id}`)}
                className="min-h-[36px] rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
              >
                {typeLabel}상세
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

export default function CancelReturnPage() {
  const { claims, isLoading, error } = useClaims()

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">취소/반품 내역</h2>

      {/* Notice bar */}
      <div className="mt-4 flex flex-col gap-3 rounded-xl bg-gray-50 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1 text-xs leading-relaxed text-gray-600">
          <p>취소/반품 신청한 내역을 확인할 수 있습니다.</p>
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
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            <p className="mt-3 text-sm text-gray-400">불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 py-10 text-center">
            <p className="text-sm text-red-600">데이터를 불러오지 못했습니다.</p>
          </div>
        ) : claims.length === 0 ? (
          <EmptyState label="취소/반품 내역이 없습니다." />
        ) : (
          claims.map((claim) => <ClaimCard key={claim.id} claim={claim} />)
        )}
      </div>
    </div>
  )
}
