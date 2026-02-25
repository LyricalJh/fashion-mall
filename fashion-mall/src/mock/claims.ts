export type ClaimType = '취소' | '반품' | '교환'

export type ClaimStatus =
  | '접수'
  | '처리중'
  | '회수중'
  | '회수완료'
  | '환불완료'
  | '교환완료'
  | '취소완료'
  | '불가'

export interface ClaimItem {
  itemId: string
  productName: string
  productDesc?: string
  thumbnailUrl: string
  quantity: number
  price: number
}

export interface Claim {
  claimId: string
  claimType: ClaimType
  status: ClaimStatus
  receivedAt: string       // "YYYY-MM-DD"
  orderedAt: string
  orderNo: string
  items: ClaimItem[]
  completeDueText?: string // 예: "9/11(목) 이내"
  paymentMethod?: '카드' | '무통장' | '간편결제' | '기타'
  note?: string
}

export type BankRefundStatus = '접수' | '처리중' | '환불완료' | '불가'

export interface BankRefund {
  refundId: string
  requestedAt: string
  orderedAt?: string
  orderNo?: string
  status: BankRefundStatus
  amount: number
  bankName?: string
  accountMasked?: string
  memo?: string
}

export const MOCK_CLAIMS: Claim[] = [
  {
    claimId: 'CLM-20250908-001',
    claimType: '반품',
    status: '환불완료',
    receivedAt: '2025-09-08',
    orderedAt: '2025-09-06',
    orderNo: '17100138304171',
    items: [
      {
        itemId: 'ci1',
        productName: 'Wool Blend Coat',
        productDesc: 'ZARA · Wool Blend Coat / 컬러: 블랙 / 사이즈: M, 1개',
        thumbnailUrl: 'https://picsum.photos/seed/coat1/120/120',
        quantity: 1,
        price: 89000,
      },
    ],
    completeDueText: '9/11(목) 이내',
    paymentMethod: '카드',
    note: '환불 완료 예정',
  },
  {
    claimId: 'CLM-20260115-002',
    claimType: '취소',
    status: '취소완료',
    receivedAt: '2026-01-16',
    orderedAt: '2026-01-15',
    orderNo: '17200115882031',
    items: [
      {
        itemId: 'ci2',
        productName: 'Midi Skirt',
        productDesc: 'ARKET · Midi Skirt / 컬러: 베이지 / 사이즈: XS, 1개',
        thumbnailUrl: 'https://picsum.photos/seed/skirt1/120/120',
        quantity: 1,
        price: 72000,
      },
    ],
    paymentMethod: '카드',
    note: '결제 취소 완료',
  },
  {
    claimId: 'CLM-20260205-003',
    claimType: '교환',
    status: '처리중',
    receivedAt: '2026-02-05',
    orderedAt: '2026-02-01',
    orderNo: '17200201554812',
    items: [
      {
        itemId: 'ci3',
        productName: 'Linen Shirt',
        productDesc: 'COS · Linen Shirt / 컬러: 화이트 / 사이즈: L → XL 교환',
        thumbnailUrl: 'https://picsum.photos/seed/shirt1/120/120',
        quantity: 1,
        price: 65000,
      },
    ],
    completeDueText: '2/12(목) 이내',
    paymentMethod: '간편결제',
    note: '사이즈 교환 처리 중',
  },
]

export const MOCK_BANK_REFUNDS: BankRefund[] = [
  {
    refundId: 'BNK-20251010-001',
    requestedAt: '2025-10-10',
    orderedAt: '2025-10-08',
    orderNo: '17100138994251',
    status: '환불완료',
    amount: 59000,
    bankName: '국민',
    accountMasked: '국민 123-****-5678',
    memo: '반품 환불 처리 완료',
  },
  {
    refundId: 'BNK-20260210-002',
    requestedAt: '2026-02-10',
    status: '처리중',
    amount: 43000,
    bankName: '신한',
    accountMasked: '신한 456-****-9012',
    memo: '영업일 기준 3~5일 소요 예정',
  },
]
