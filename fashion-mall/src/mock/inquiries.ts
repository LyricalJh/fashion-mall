export type InquiryStatus = 'PENDING' | 'ANSWERED' | 'CLOSED'
export type InquiryCategory = 'PRODUCT' | 'DELIVERY' | 'EXCHANGE_RETURN' | 'PAYMENT' | 'OTHER'

export interface Inquiry {
  id: number
  title: string
  content: string
  category: InquiryCategory
  orderId?: number
  orderProductName?: string
  status: InquiryStatus
  createdAt: string   // "YYYY-MM-DD"
  answer?: string
  answeredAt?: string
}

export const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: 1,
    title: '배송이 언제 출발하나요?',
    content: '주문한 지 3일이 지났는데 아직 배송이 시작되지 않았습니다. 확인 부탁드립니다.',
    category: 'DELIVERY',
    orderId: 1,
    orderProductName: 'Wool Blend Coat',
    status: 'ANSWERED',
    createdAt: '2026-02-20',
    answer: '안녕하세요, 고객님. 해당 상품은 현재 출고 준비 중이며, 내일 중으로 발송될 예정입니다. 감사합니다.',
    answeredAt: '2026-02-21',
  },
  {
    id: 2,
    title: '사이즈 교환 문의드립니다',
    content: 'M사이즈로 주문했는데 좀 작은 것 같습니다. L사이즈로 교환 가능한지 문의드립니다.',
    category: 'EXCHANGE_RETURN',
    orderId: 2,
    orderProductName: 'Linen Shirt',
    status: 'PENDING',
    createdAt: '2026-02-24',
  },
  {
    id: 3,
    title: '결제 금액이 다르게 청구되었습니다',
    content: '쿠폰 적용 후 59,000원이어야 하는데 69,000원이 결제되었습니다. 확인 부탁드립니다.',
    category: 'PAYMENT',
    status: 'ANSWERED',
    createdAt: '2026-02-18',
    answer: '안녕하세요, 고객님. 확인 결과 쿠폰이 정상 적용되지 않은 것으로 확인됩니다. 차액 10,000원은 환불 처리해드리겠습니다.',
    answeredAt: '2026-02-19',
  },
]
