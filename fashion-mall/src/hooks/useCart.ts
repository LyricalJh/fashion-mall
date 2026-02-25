import useSWR, { type KeyedMutator } from 'swr'
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/apiClient'
import type { CartResponse } from '../types/api'
import { useAuthStore } from '../store/authStore'

const CART_KEY = '/cart'

interface UseCartResult {
  cart: CartResponse | undefined
  isLoading: boolean
  error: Error | undefined
  addToCart: (productId: number, quantity: number) => Promise<void>
  updateItem: (cartItemId: number, quantity: number) => Promise<void>
  removeItem: (cartItemId: number) => Promise<void>
  mutate: KeyedMutator<CartResponse>
}

export function useCart(): UseCartResult {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  // SWR key가 null이면 fetch 하지 않음 (비인증 상태)
  const swrKey = isLoggedIn ? CART_KEY : null

  const { data, error, isLoading, mutate } = useSWR<CartResponse>(swrKey, () =>
    apiGet<CartResponse>(CART_KEY),
  )

  async function addToCart(productId: number, quantity: number): Promise<void> {
    await apiPost<CartResponse>(CART_KEY, { productId, quantity })
    await mutate()
  }

  async function updateItem(cartItemId: number, quantity: number): Promise<void> {
    await apiPut<CartResponse>(`${CART_KEY}/${cartItemId}`, { quantity })
    await mutate()
  }

  async function removeItem(cartItemId: number): Promise<void> {
    await apiDelete(`${CART_KEY}/${cartItemId}`)
    await mutate()
  }

  return {
    cart: data,
    isLoading,
    error: error as Error | undefined,
    addToCart,
    updateItem,
    removeItem,
    mutate,
  }
}
