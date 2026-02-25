import useSWR from 'swr'
import { apiGet } from '../lib/apiClient'
import type { ProductPage, ProductSummary } from '../types/api'

interface UseProductsParams {
  categoryId?: number
  sort?: string
  page?: number
  size?: number
}

interface UseProductsResult {
  products: ProductSummary[]
  pagination: {
    totalElements: number
    totalPages: number
    pageNumber: number
    pageSize: number
  }
  isLoading: boolean
  error: Error | undefined
}

function buildKey(params: UseProductsParams): string {
  const query = new URLSearchParams()

  if (params.categoryId !== undefined) {
    query.set('categoryId', String(params.categoryId))
  }
  if (params.sort !== undefined) {
    query.set('sort', params.sort)
  }
  query.set('page', String(params.page ?? 0))
  query.set('size', String(params.size ?? 10))

  return `/products?${query.toString()}`
}

export function useProducts(params: UseProductsParams = {}): UseProductsResult {
  const key = buildKey(params)

  const { data, error, isLoading } = useSWR<ProductPage>(key, () =>
    apiGet<ProductPage>(key),
  )

  return {
    products: data?.content ?? [],
    pagination: {
      totalElements: data?.totalElements ?? 0,
      totalPages: data?.totalPages ?? 0,
      pageNumber: data?.pageNumber ?? 0,
      pageSize: data?.pageSize ?? (params.size ?? 10),
    },
    isLoading,
    error: error as Error | undefined,
  }
}
