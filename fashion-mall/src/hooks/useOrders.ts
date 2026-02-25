import useSWR from 'swr'
import { apiGet, apiDelete } from '../lib/apiClient'
import type { OrderPage, OrderSummaryResponse, OrderResponse } from '../types/api'
import { useAuthStore } from '../store/authStore'

interface UseOrdersResult {
  orders: OrderSummaryResponse[]
  isLoading: boolean
  error: Error | undefined
}

interface UseOrderResult {
  order: OrderResponse | undefined
  isLoading: boolean
  error: Error | undefined
}

export function useOrders(page = 0, size = 50): UseOrdersResult {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const key = isLoggedIn ? `/orders?page=${page}&size=${size}` : null

  const { data, error, isLoading } = useSWR<OrderPage>(key, () =>
    apiGet<OrderPage>(`/orders?page=${page}&size=${size}`),
  )

  return {
    orders: data?.content ?? [],
    isLoading,
    error: error as Error | undefined,
  }
}

export function useOrder(id: number | null): UseOrderResult {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const key = isLoggedIn && id !== null ? `/orders/${id}` : null

  const { data, error, isLoading } = useSWR<OrderResponse>(key, () =>
    apiGet<OrderResponse>(`/orders/${id!}`),
  )

  return {
    order: data,
    isLoading,
    error: error as Error | undefined,
  }
}

export async function cancelOrder(id: number): Promise<void> {
  await apiDelete(`/orders/${id}`)
}
