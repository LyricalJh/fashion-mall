export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: { code: string; message: string }
}

export interface ProductSummary {
  id: number
  name: string
  price: number
  stock: number
  categoryId: number
  categoryName: string
  thumbnailUrl: string | null
  productCode?: string
  status?: string
}

export interface ProductDetail {
  id: number
  name: string
  description: string
  price: number
  stock: number
  categoryId: number
  categoryName: string
  images: string[]
  productCode?: string
  status?: string
  shippingFee?: number
  shippingInfo?: string
}

export interface ProductPage {
  content: ProductSummary[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
}

export interface CategoryItem {
  id: number
  name: string
  description: string
  displayOrder: number
  parentId?: number
  depth?: number
}

export interface CartItemResponse {
  id: number
  productId: number
  productName: string
  productPrice: number
  imageUrl: string | null
  quantity: number
  subtotal: number
}

export interface CartResponse {
  items: CartItemResponse[]
  totalAmount: number
  totalCount: number
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  userId: number
  email: string
  name: string
  role: string
  phone?: string
  postcode?: string
  address?: string
  addressDetail?: string
}

export interface OrderItemResponse {
  id: number
  productId: number
  productName: string
  quantity: number
  priceAtOrder: number
  subtotal: number
}

export interface OrderSummaryItemResponse {
  productId: number
  productName: string
  imageUrl?: string
  quantity: number
  price: number
}

export interface OrderSummaryResponse {
  id: number
  totalPrice: number
  status: string // PENDING | CONFIRMED | PAID | SHIPPING | DELIVERED | CANCELLED
  itemCount: number
  createdAt: string // ISO 8601
  orderNumber?: string
  items: OrderSummaryItemResponse[]
}

export interface OrderPage {
  content: OrderSummaryResponse[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
}

export interface OrderResponse {
  id: number
  userId: number
  items: OrderItemResponse[]
  totalPrice: number
  status: string
  shippingAddress: string
  receiverName: string
  receiverPhone: string
  createdAt: string
  orderNumber?: string
  shippingMemo?: string
}

export interface CreateOrderRequest {
  items: { productId: number; quantity: number }[]
  shippingAddress: string
  receiverName: string
  receiverPhone: string
  shippingMemo?: string
}

// ─── Coupon ────────────────────────────────────────────────────────────────

export type CouponStatus = 'AVAILABLE' | 'USED' | 'EXPIRED'
export type DiscountType = 'PERCENTAGE' | 'FIXED'

export interface Coupon {
  id: number
  couponName: string
  discountType: DiscountType
  discountValue: number
  minOrderAmount: number
  maxDiscountAmount?: number
  expiryDate: string
  status: CouponStatus
  description?: string
  usedAt?: string
  createdAt: string
}

// ─── Inquiry Pagination ──────────────────────────────────────────────────────

export interface InquiryPage {
  content: Inquiry[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
}

// ─── Inquiry ───────────────────────────────────────────────────────────────

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
  createdAt: string
  answer?: string
  answeredAt?: string
}

// ─── Address ───────────────────────────────────────────────────────────────

export interface AddressResponse {
  id: number
  receiverName: string
  receiverPhone: string
  zipCode: string
  address: string
  addressDetail: string
  isDefault: boolean
  createdAt?: string
}

export interface CreateAddressRequest {
  receiverName: string
  receiverPhone: string
  zipCode: string
  address: string
  addressDetail?: string
  isDefault?: boolean
}
