import useSWR from 'swr'
import { apiGet } from '../lib/apiClient'
import type { Coupon } from '../types/api'
import { useAuthStore } from '../store/authStore'

interface UseCouponsResult {
  coupons: Coupon[]
  isLoading: boolean
  error: Error | undefined
}

export function useCoupons(): UseCouponsResult {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const key = isLoggedIn ? '/coupons' : null

  const { data, error, isLoading } = useSWR<Coupon[]>(key, () =>
    apiGet<Coupon[]>('/coupons'),
  )

  return {
    coupons: data ?? [],
    isLoading,
    error: error as Error | undefined,
  }
}

export function useAvailableCoupons(): UseCouponsResult {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const key = isLoggedIn ? '/coupons/available' : null

  const { data, error, isLoading } = useSWR<Coupon[]>(key, () =>
    apiGet<Coupon[]>('/coupons/available'),
  )

  return {
    coupons: data ?? [],
    isLoading,
    error: error as Error | undefined,
  }
}
