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
}

export interface OrderItemResponse {
  id: number
  productId: number
  productName: string
  quantity: number
  priceAtOrder: number
  subtotal: number
}

export interface OrderSummaryResponse {
  id: number
  totalPrice: number
  status: string // PENDING | CONFIRMED | PAID | SHIPPING | DELIVERED | CANCELLED
  itemCount: number
  createdAt: string // ISO 8601
  orderNumber?: string
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
