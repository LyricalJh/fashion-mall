import { useState, useMemo } from 'react'
import { useCoupons } from '../../hooks/useCoupons'
import type { Coupon, CouponStatus } from '../../types/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(n: number): string {
  return n.toLocaleString('ko-KR')
}

function fmtDate(s: string): string {
  const date = new Date(s)
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`
}

function getDaysLeft(until: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const end = new Date(until)
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function toKoreanStatus(status: CouponStatus): string {
  if (status === 'AVAILABLE') return '사용가능'
  if (status === 'USED') return '사용완료'
  return '만료'
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterKey = 'ALL' | CouponStatus

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'AVAILABLE', label: '사용가능' },
  { key: 'USED', label: '사용완료' },
  { key: 'EXPIRED', label: '만료' },
]

function filterCoupons(coupons: Coupon[], filter: FilterKey): Coupon[] {
  if (filter === 'ALL') return coupons
  return coupons.filter((c) => c.status === filter)
}

// ─── Status styles ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<CouponStatus, { badge: string; card: string; accent: string }> = {
  AVAILABLE: {
    badge: 'bg-emerald-100 text-emerald-700',
    card: 'border-gray-200',
    accent: 'from-rose-500 to-pink-600',
  },
  USED: {
    badge: 'bg-gray-100 text-gray-500',
    card: 'border-gray-200 opacity-60',
    accent: 'from-gray-400 to-gray-500',
  },
  EXPIRED: {
    badge: 'bg-red-50 text-red-500',
    card: 'border-gray-200 opacity-60',
    accent: 'from-gray-400 to-gray-500',
  },
}

// ─── CouponCard ───────────────────────────────────────────────────────────────

function CouponCard({ coupon }: { coupon: Coupon }) {
  const style = STATUS_STYLES[coupon.status]
  const daysLeft = getDaysLeft(coupon.expiryDate)
  const isActive = coupon.status === 'AVAILABLE'

  return (
    <div className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${style.card}`}>
      <div className="flex">
        {/* Left: discount badge area */}
        <div className={`relative flex w-28 shrink-0 flex-col items-center justify-center bg-gradient-to-br ${style.accent} px-3 sm:w-36`}>
          {/* Decorative circles for "ticket cut" effect */}
          <div className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white" />

          <span className="text-3xl font-black text-white sm:text-4xl">
            {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `${fmtPrice(coupon.discountValue)}`}
          </span>
          {coupon.discountType === 'FIXED' && (
            <span className="mt-0.5 text-xs font-bold text-white/80">원 할인</span>
          )}
          {coupon.discountType === 'PERCENTAGE' && (
            <span className="mt-0.5 text-xs font-bold text-white/80">할인</span>
          )}
        </div>

        {/* Right: coupon info */}
        <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
          {/* Top section */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold text-gray-900 line-clamp-1 sm:text-base">{coupon.couponName}</h3>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${style.badge}`}>
                {toKoreanStatus(coupon.status)}
              </span>
            </div>

            {/* Conditions */}
            <div className="mt-2 space-y-0.5">
              <p className="text-xs text-gray-500">
                {fmtPrice(coupon.minOrderAmount)}원 이상 구매 시
              </p>
              {coupon.discountType === 'PERCENTAGE' && coupon.maxDiscountAmount && (
                <p className="text-xs text-gray-400">
                  최대 {fmtPrice(coupon.maxDiscountAmount)}원 할인
                </p>
              )}
            </div>
          </div>

          {/* Bottom section: dates + daysLeft */}
          <div className="mt-3 flex items-end justify-between">
            <span className="text-[11px] text-gray-400">
              {fmtDate(coupon.createdAt)} ~ {fmtDate(coupon.expiryDate)}
            </span>
            {isActive && daysLeft <= 7 && daysLeft > 0 && (
              <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-500">
                D-{daysLeft}
              </span>
            )}
            {isActive && daysLeft <= 0 && (
              <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-500">
                오늘 만료
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dashed divider line between left and right (inside the ticket cut area) */}
      <div className="pointer-events-none absolute left-[7rem] top-3 bottom-3 border-l border-dashed border-white/30 sm:left-[9rem]" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CouponPage() {
  const [filter, setFilter] = useState<FilterKey>('ALL')

  const { coupons, isLoading } = useCoupons()

  const filtered = useMemo(() => filterCoupons(coupons, filter), [coupons, filter])

  const availableCount = coupons.filter((c) => c.status === 'AVAILABLE').length

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-bold text-gray-900">쿠폰/이용권</h2>
        <p className="text-sm text-gray-500">
          사용 가능 <span className="font-bold text-rose-600">{availableCount}</span>장
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mt-5 flex gap-2">
        {FILTER_TABS.map(({ key, label }) => {
          const count = key === 'ALL' ? coupons.length : coupons.filter((c) => c.status === key).length
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === key
                  ? 'border-rose-500 bg-rose-500 text-white'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {label}
              <span className="ml-1 text-xs">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Coupon list */}
      <div className="mt-6 flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
            <svg
              className="mx-auto mb-3 h-10 w-10 text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M20 12V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6" />
              <path d="M2 12h.01" />
              <path d="M22 12h.01" />
              <path d="M2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6" />
              <line x1="12" y1="7" x2="12" y2="17" strokeDasharray="2 2" />
            </svg>
            <p className="text-sm font-medium text-gray-400">
              {filter === 'ALL' ? '보유 중인 쿠폰이 없습니다.' : `${FILTER_TABS.find((t) => t.key === filter)?.label} 쿠폰이 없습니다.`}
            </p>
            <p className="mt-1 text-xs text-gray-300">발급받은 쿠폰이 여기에 표시됩니다.</p>
          </div>
        ) : (
          filtered.map((coupon) => <CouponCard key={coupon.id} coupon={coupon} />)
        )}
      </div>

      {/* Info note */}
      <div className="mt-6 rounded-xl bg-gray-50 px-4 py-3.5">
        <p className="text-xs font-semibold text-gray-500">쿠폰 이용 안내</p>
        <ul className="mt-2 space-y-1 text-xs leading-relaxed text-gray-400">
          <li>- 쿠폰은 최소 주문금액 이상 구매 시 사용 가능합니다.</li>
          <li>- 일부 상품 및 브랜드는 쿠폰 적용이 제외될 수 있습니다.</li>
          <li>- 유효기간이 지난 쿠폰은 자동으로 만료 처리됩니다.</li>
          <li>- 쿠폰은 중복 사용이 불가합니다.</li>
        </ul>
      </div>
    </div>
  )
}
