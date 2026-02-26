import useSWR from 'swr'
import { apiGet, apiPost, apiDelete } from '../lib/apiClient'
import type {
  ClaimPage,
  ClaimSummaryResponse,
  ClaimResponse,
  CreateClaimRequest,
} from '../types/api'
import { useAuthStore } from '../store/authStore'

interface UseClaimsResult {
  claims: ClaimSummaryResponse[]
  isLoading: boolean
  error: Error | undefined
  mutate: () => void
}

interface UseClaimResult {
  claim: ClaimResponse | undefined
  isLoading: boolean
  error: Error | undefined
  mutate: () => void
}

export function useClaims(page = 0, size = 10): UseClaimsResult {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const key = isLoggedIn ? `/claims?page=${page}&size=${size}` : null

  const { data, error, isLoading, mutate } = useSWR<ClaimPage>(key, () =>
    apiGet<ClaimPage>(`/claims?page=${page}&size=${size}`),
  )

  return {
    claims: data?.content ?? [],
    isLoading,
    error: error as Error | undefined,
    mutate,
  }
}

export function useClaim(id: number | null): UseClaimResult {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const key = isLoggedIn && id !== null ? `/claims/${id}` : null

  const { data, error, isLoading, mutate } = useSWR<ClaimResponse>(key, () =>
    apiGet<ClaimResponse>(`/claims/${id!}`),
  )

  return {
    claim: data,
    isLoading,
    error: error as Error | undefined,
    mutate,
  }
}

export async function createClaim(request: CreateClaimRequest): Promise<ClaimResponse> {
  return apiPost<ClaimResponse>('/claims', request)
}

export async function withdrawClaim(id: number): Promise<void> {
  await apiDelete(`/claims/${id}`)
}
