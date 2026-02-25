import useSWR from 'swr'
import { apiGet } from '../lib/apiClient'
import type { CategoryItem } from '../types/api'

interface UseCategoriesResult {
  categories: CategoryItem[]
  isLoading: boolean
  error: Error | undefined
}

const CATEGORIES_KEY = '/categories'

export function useCategories(): UseCategoriesResult {
  const { data, error, isLoading } = useSWR<CategoryItem[]>(CATEGORIES_KEY, () =>
    apiGet<CategoryItem[]>(CATEGORIES_KEY),
  )

  return {
    categories: data ?? [],
    isLoading,
    error: error as Error | undefined,
  }
}
