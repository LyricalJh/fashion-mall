export type CouponStatus = 'AVAILABLE' | 'USED' | 'EXPIRED'
export type DiscountType = 'PERCENTAGE' | 'FIXED'

export interface Coupon {
  id: number
  couponName: string
  discountType: DiscountType
  discountValue: number      // PERCENTAGE: 10 → 10%, FIXED: 5000 → 5,000원
  minOrderAmount: number     // 최소 주문금액
  maxDiscountAmount?: number // PERCENTAGE 타입일 때 최대 할인금액
  validFrom: string          // "YYYY-MM-DD"
  expiryDate: string
  status: CouponStatus
  description?: string
}

export const MOCK_COUPONS: Coupon[] = [
  {
    id: 1,
    couponName: '신규 가입 축하 쿠폰',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderAmount: 30000,
    maxDiscountAmount: 10000,
    validFrom: '2026-02-01',
    expiryDate: '2026-03-31',
    status: 'AVAILABLE',
    description: '첫 구매 시 사용 가능',
  },
  {
    id: 2,
    couponName: '봄맞이 특별 할인',
    discountType: 'FIXED',
    discountValue: 5000,
    minOrderAmount: 50000,
    validFrom: '2026-02-15',
    expiryDate: '2026-04-15',
    status: 'AVAILABLE',
    description: '5만원 이상 구매 시',
  },
  {
    id: 3,
    couponName: 'VIP 전용 할인 쿠폰',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderAmount: 100000,
    maxDiscountAmount: 30000,
    validFrom: '2026-01-01',
    expiryDate: '2026-06-30',
    status: 'AVAILABLE',
    description: '10만원 이상 구매 시',
  },
  {
    id: 4,
    couponName: '겨울 시즌 감사 쿠폰',
    discountType: 'FIXED',
    discountValue: 3000,
    minOrderAmount: 20000,
    validFrom: '2025-12-01',
    expiryDate: '2026-01-31',
    status: 'EXPIRED',
    description: '기간이 만료되었습니다',
  },
  {
    id: 5,
    couponName: '주문 감사 쿠폰',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 40000,
    maxDiscountAmount: 8000,
    validFrom: '2026-01-10',
    expiryDate: '2026-02-10',
    status: 'USED',
    description: '2026.01.25 사용',
  },
]
