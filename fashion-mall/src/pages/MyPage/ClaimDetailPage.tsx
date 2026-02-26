import { useParams, Link, useNavigate } from 'react-router-dom'
import { useClaim, withdrawClaim } from '../../hooks/useClaims'
import type { ClaimType, ClaimStatus } from '../../types/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

function fmtPrice(n: number | null | undefined): string {
  if (n == null) return '-'
  return n.toLocaleString('ko-KR') + '원'
}

function getTypeLabel(type: ClaimType): string {
  return type === 'CANCEL' ? '취소' : '반품'
}

function getStatusLabel(type: ClaimType, status: ClaimStatus): string {
  if (status === 'COMPLETED') {
    return type === 'CANCEL' ? '취소완료' : '환불완료'
  }
  const map: Record<ClaimStatus, string> = {
    RECEIVED: '접수',
    PROCESSING: '처리중',
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
      return 'text-emerald-600 bg-emerald-50'
    case 'RECEIVED':
    case 'PROCESSING':
      return 'text-blue-600 bg-blue-50'
    case 'PICKUP':
      return 'text-orange-600 bg-orange-50'
    case 'REJECTED':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

// ─── Status Steps ─────────────────────────────────────────────────────────────

const CANCEL_STEPS: ClaimStatus[] = ['RECEIVED', 'PROCESSING', 'COMPLETED']
const RETURN_STEPS: ClaimStatus[] = ['RECEIVED', 'PROCESSING', 'PICKUP', 'PICKED_UP', 'COMPLETED']

function StatusSteps({ type, current }: { type: ClaimType; current: ClaimStatus }) {
  const steps = type === 'CANCEL' ? CANCEL_STEPS : RETURN_STEPS

  if (current === 'REJECTED') {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
        처리 불가
      </div>
    )
  }

  const currentIdx = steps.indexOf(current)

  return (
    <div className="flex items-center justify-between gap-1">
      {steps.map((step, i) => {
        const done = i <= currentIdx
        const label = getStatusLabel(type, step)
        return (
          <div key={step} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                done ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-center text-[11px] leading-tight ${done ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClaimDetailPage() {
  const { claimId } = useParams()
  const navigate = useNavigate()
  const id = claimId ? Number(claimId) : null
  const { claim, isLoading, error } = useClaim(id)

  async function handleWithdraw() {
    if (!claim || !confirm('클레임을 철회하시겠습니까?')) return
    try {
      await withdrawClaim(claim.id)
      alert('클레임이 철회되었습니다.')
      navigate('/mypage/returns')
    } catch (e) {
      alert(e instanceof Error ? e.message : '철회에 실패했습니다.')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/mypage/returns"
          className="flex items-center text-gray-400 transition-colors hover:text-gray-900"
          aria-label="목록으로"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-xl font-bold text-gray-900">
          {claim ? `${getTypeLabel(claim.claimType)} 상세` : '클레임 상세'}
        </h2>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="py-20 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          <p className="mt-3 text-sm text-gray-400">불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 py-10 text-center">
          <p className="text-sm text-red-600">클레임 정보를 불러오지 못했습니다.</p>
        </div>
      )}

      {claim && (
        <div className="space-y-6">
          {/* Status badge + steps */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(claim.status)}`}>
                {getStatusLabel(claim.claimType, claim.status)}
              </span>
              <span className="text-xs text-gray-400">접수일 {fmtDate(claim.createdAt)}</span>
            </div>
            <StatusSteps type={claim.claimType} current={claim.status} />
          </div>

          {/* Order info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-gray-900">주문 정보</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-gray-500">주문번호</dt>
              <dd className="text-right text-gray-900">{claim.orderNumber}</dd>
              <dt className="text-gray-500">클레임 유형</dt>
              <dd className="text-right text-gray-900">{getTypeLabel(claim.claimType)}</dd>
              <dt className="text-gray-500">사유</dt>
              <dd className="text-right text-gray-900">{claim.reason}</dd>
              {claim.note && (
                <>
                  <dt className="text-gray-500">관리자 메모</dt>
                  <dd className="text-right text-gray-900">{claim.note}</dd>
                </>
              )}
            </dl>
          </div>

          {/* Claim items */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-gray-900">클레임 상품</h3>
            <div className="divide-y divide-gray-100">
              {claim.items.map((item) => (
                <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.productName}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{item.quantity}개</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-gray-900">{fmtPrice(item.subtotal)}</p>
                    <p className="text-xs text-gray-400">{fmtPrice(item.priceAtOrder)} / 개</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Refund info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-gray-900">환불 정보</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-gray-500">환불 금액</dt>
              <dd className="text-right font-bold text-blue-600">{fmtPrice(claim.refundAmount)}</dd>
              <dt className="text-gray-500">결제 수단</dt>
              <dd className="text-right text-gray-900">{claim.refundMethod ?? '-'}</dd>
              {claim.bankName && (
                <>
                  <dt className="text-gray-500">환불 계좌</dt>
                  <dd className="text-right text-gray-900">{claim.bankName} {claim.accountNumber}</dd>
                </>
              )}
              {claim.completedAt && (
                <>
                  <dt className="text-gray-500">완료일</dt>
                  <dd className="text-right text-gray-900">{fmtDate(claim.completedAt)}</dd>
                </>
              )}
            </dl>
          </div>

          {/* Withdraw button — only for RECEIVED status */}
          {claim.status === 'RECEIVED' && (
            <button
              onClick={handleWithdraw}
              className="w-full rounded-xl border border-red-300 py-3.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              클레임 철회
            </button>
          )}
        </div>
      )}
    </div>
  )
}
