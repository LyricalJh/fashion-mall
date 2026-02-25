export type CartItem = {
  id: string
  brand?: string
  name: string
  optionText?: string
  imageUrl: string
  price: number
  originalPrice?: number
  discountRate?: number
  quantity: number
  selected: boolean
  deliveryText?: string
}
