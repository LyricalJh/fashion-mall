import useSWR, { type KeyedMutator } from 'swr'
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '../lib/apiClient'
import type { AddressResponse, CreateAddressRequest } from '../types/api'
import { useAuthStore } from '../store/authStore'

interface UseAddressesResult {
  addresses: AddressResponse[]
  isLoading: boolean
  error: Error | undefined
  addAddress: (data: CreateAddressRequest) => Promise<void>
  updateAddress: (id: number, data: CreateAddressRequest) => Promise<void>
  removeAddress: (id: number) => Promise<void>
  setDefault: (id: number) => Promise<void>
  mutate: KeyedMutator<AddressResponse[]>
}

export function useAddresses(): UseAddressesResult {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const key = isLoggedIn ? '/addresses' : null

  const { data, error, isLoading, mutate } = useSWR<AddressResponse[]>(key, () =>
    apiGet<AddressResponse[]>('/addresses'),
  )

  async function addAddress(body: CreateAddressRequest): Promise<void> {
    await apiPost<AddressResponse>('/addresses', body)
    await mutate()
  }

  async function updateAddress(id: number, body: CreateAddressRequest): Promise<void> {
    await apiPut<AddressResponse>(`/addresses/${id}`, body)
    await mutate()
  }

  async function removeAddress(id: number): Promise<void> {
    await apiDelete(`/addresses/${id}`)
    await mutate()
  }

  async function setDefault(id: number): Promise<void> {
    await apiPatch<AddressResponse>(`/addresses/${id}/default`)
    await mutate()
  }

  return {
    addresses: data ?? [],
    isLoading,
    error: error as Error | undefined,
    addAddress,
    updateAddress,
    removeAddress,
    setDefault,
    mutate,
  }
}
