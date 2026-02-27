import useSWR from 'swr'
import { apiGet } from '../lib/apiClient'
import type { CurationResponse } from '../types/api'

export function useCurations() {
  const { data, isLoading, error } = useSWR<CurationResponse[]>(
    '/curations',
    () => apiGet<CurationResponse[]>('/curations')
  )
  return { curations: data ?? [], isLoading, error }
}
