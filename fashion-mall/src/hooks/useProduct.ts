import useSWR from 'swr'
import { apiGet } from '../lib/apiClient'
import type { ProductDetail } from '../types/api'

interface UseProductResult {
  product: ProductDetail | undefined
  isLoading: boolean
  error: Error | undefined
}

export function useProduct(id: number | null): UseProductResult {
  const key = id !== null ? `/products/${id}` : null

  const { data, error, isLoading } = useSWR<ProductDetail>(key, () =>
    apiGet<ProductDetail>(`/products/${id!}`),
  )

  return {
    product: data,
    isLoading,
    error: error as Error | undefined,
  }
}
