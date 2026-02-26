import { apiPost } from './apiClient'
import { useStore } from '../store/useStore'

export async function mergeLocalCartToServer(): Promise<void> {
  const { cartItems, clearCart } = useStore.getState()
  if (cartItems.length === 0) return

  await Promise.allSettled(
    cartItems.map((item) =>
      apiPost('/cart', {
        productId: Number(item.id),
        quantity: item.quantity,
      })
    )
  )

  clearCart()
}
