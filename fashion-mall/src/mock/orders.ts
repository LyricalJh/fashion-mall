export type OrderStatus = '배송완료' | '배송중' | '결제완료' | '취소' | '반품' | '교환'

export interface OrderItem {
  itemId: string
  brandBadge?: string
  productName: string
  optionText?: string
  price: number
  quantity: number
  thumbnailUrl: string
}

export interface Order {
  orderId: string
  orderedAt: string   // "YYYY-MM-DD"
  status: OrderStatus
  deliveredAt?: string
  items: OrderItem[]
}

export const MOCK_ORDERS: Order[] = [
  {
    orderId: 'ORD-20260220-8421',
    orderedAt: '2026-02-20',
    status: '배송완료',
    deliveredAt: '2026-02-21',
    items: [
      {
        itemId: 'i1',
        brandBadge: 'ZARA',
        productName: 'Wool Blend Coat',
        optionText: '컬러: 블랙 / 사이즈: M',
        price: 89000,
        quantity: 1,
        thumbnailUrl: 'https://picsum.photos/seed/coat1/120/120',
      },
      {
        itemId: 'i2',
        brandBadge: 'ZARA',
        productName: 'Wide Leg Trousers',
        optionText: '컬러: 네이비 / 사이즈: S',
        price: 49000,
        quantity: 1,
        thumbnailUrl: 'https://picsum.photos/seed/pants1/120/120',
      },
    ],
  },
  {
    orderId: 'ORD-20260210-5392',
    orderedAt: '2026-02-10',
    status: '배송중',
    items: [
      {
        itemId: 'i3',
        brandBadge: 'COS',
        productName: 'Linen Shirt',
        optionText: '컬러: 화이트 / 사이즈: L',
        price: 65000,
        quantity: 2,
        thumbnailUrl: 'https://picsum.photos/seed/shirt1/120/120',
      },
    ],
  },
  {
    orderId: 'ORD-20260115-2871',
    orderedAt: '2026-01-15',
    status: '결제완료',
    items: [
      {
        itemId: 'i4',
        brandBadge: 'ARKET',
        productName: 'Midi Skirt',
        optionText: '컬러: 베이지 / 사이즈: XS',
        price: 72000,
        quantity: 1,
        thumbnailUrl: 'https://picsum.photos/seed/skirt1/120/120',
      },
    ],
  },
  {
    orderId: 'ORD-20251225-9931',
    orderedAt: '2025-12-25',
    status: '배송완료',
    deliveredAt: '2025-12-27',
    items: [
      {
        itemId: 'i5',
        brandBadge: 'MANGO',
        productName: 'Satin Wrap Dress',
        optionText: '컬러: 버건디 / 사이즈: S',
        price: 55000,
        quantity: 1,
        thumbnailUrl: 'https://picsum.photos/seed/dress1/120/120',
      },
      {
        itemId: 'i6',
        brandBadge: 'MANGO',
        productName: 'Mini Crossbody',
        optionText: '컬러: 블랙',
        price: 43000,
        quantity: 1,
        thumbnailUrl: 'https://picsum.photos/seed/bag1/120/120',
      },
      {
        itemId: 'i7',
        brandBadge: 'MANGO',
        productName: 'Block Heel Mules',
        optionText: '사이즈: 37',
        price: 82000,
        quantity: 1,
        thumbnailUrl: 'https://picsum.photos/seed/shoes1/120/120',
      },
    ],
  },
  {
    orderId: 'ORD-20251010-4412',
    orderedAt: '2025-10-10',
    status: '반품',
    items: [
      {
        itemId: 'i8',
        brandBadge: 'H&M',
        productName: 'Denim Jacket',
        optionText: '컬러: 블루 / 사이즈: M',
        price: 59000,
        quantity: 1,
        thumbnailUrl: 'https://picsum.photos/seed/jacket1/120/120',
      },
    ],
  },
]
