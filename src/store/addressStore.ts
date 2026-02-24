export interface Address {
  addressId: string
  label: string
  receiverName: string
  phone: string
  zipCode: string
  address1: string
  address2: string
  normalDeliveryMemo?: string
  dawnDeliveryMemo?: string
  extraNote?: string
  canRocketFresh?: boolean
  canRocketWow?: boolean
  isDefault: boolean
  createdAt?: string
  updatedAt?: string
}

export const ADDRESS_STORAGE_KEY = 'APP_ADDRESSES_V1'

const SEED_ADDRESSES: Address[] = [
  {
    addressId: 'addr-1',
    label: '집',
    receiverName: '김지수',
    phone: '010-1234-5678',
    zipCode: '06234',
    address1: '서울특별시 강남구 테헤란로 123',
    address2: '456호',
    normalDeliveryMemo: '문 앞',
    dawnDeliveryMemo: '공동현관',
    canRocketFresh: true,
    canRocketWow: true,
    isDefault: true,
    createdAt: '2026-01-01',
  },
  {
    addressId: 'addr-2',
    label: '회사',
    receiverName: '김지수',
    phone: '010-1234-5678',
    zipCode: '04524',
    address1: '서울특별시 중구 세종대로 110',
    address2: '8층 마케팅팀',
    normalDeliveryMemo: '경비실',
    canRocketWow: true,
    isDefault: false,
    createdAt: '2026-01-15',
  },
  {
    addressId: 'addr-3',
    label: '부모님댁',
    receiverName: '김철수',
    phone: '010-9876-5432',
    zipCode: '48060',
    address1: '부산광역시 해운대구 해운대해변로 264',
    address2: '',
    normalDeliveryMemo: '택배함',
    canRocketFresh: true,
    isDefault: false,
    createdAt: '2026-02-01',
  },
  {
    addressId: 'addr-4',
    label: '친구집',
    receiverName: '이민준',
    phone: '010-5555-4444',
    zipCode: '03925',
    address1: '서울특별시 마포구 와우산로 94',
    address2: '',
    isDefault: false,
    createdAt: '2026-02-10',
  },
]

export function loadAddresses(): Address[] {
  try {
    const raw = localStorage.getItem(ADDRESS_STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Address[]
    // 최초 진입: 시드 데이터 저장
    saveAddresses(SEED_ADDRESSES)
    return SEED_ADDRESSES
  } catch {
    return SEED_ADDRESSES
  }
}

export function saveAddresses(addresses: Address[]): void {
  localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addresses))
}

/** targetId를 기본배송지로 설정하고 나머지는 false */
export function applyDefault(addresses: Address[], targetId: string): Address[] {
  return addresses.map((a) => ({ ...a, isDefault: a.addressId === targetId }))
}

export function generateAddressId(): string {
  return `addr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/** 숫자 입력을 010-XXXX-XXXX 형태로 자동 포맷 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

export const NORMAL_MEMO_OPTIONS = [
  '선택 안 함',
  '문 앞',
  '경비실',
  '택배함',
  '직접 받고 부재 시 문 앞',
  '기타(직접입력)',
] as const

export const DAWN_MEMO_OPTIONS = [
  '선택 안 함',
  '문 앞',
  '공동현관',
  '택배함',
  '기타(직접입력)',
] as const
