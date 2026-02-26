import useSWR, { type KeyedMutator } from 'swr'
import { apiGet, apiPost } from '../lib/apiClient'
import type { Inquiry, InquiryCategory, InquiryPage } from '../types/api'
import { useAuthStore } from '../store/authStore'

interface UseInquiriesResult {
  inquiries: Inquiry[]
  isLoading: boolean
  error: Error | undefined
  submitInquiry: (data: {
    category: InquiryCategory
    orderId?: number
    title: string
    content: string
  }) => Promise<void>
  mutate: KeyedMutator<InquiryPage>
}

export function useInquiries(): UseInquiriesResult {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const key = isLoggedIn ? '/inquiries' : null

  const { data, error, isLoading, mutate } = useSWR<InquiryPage>(key, () =>
    apiGet<InquiryPage>('/inquiries'),
  )

  async function submitInquiry(body: {
    category: InquiryCategory
    orderId?: number
    title: string
    content: string
  }): Promise<void> {
    await apiPost<Inquiry>('/inquiries', body)
    await mutate()
  }

  return {
    inquiries: data?.content ?? [],
    isLoading,
    error: error as Error | undefined,
    submitInquiry,
    mutate,
  }
}
