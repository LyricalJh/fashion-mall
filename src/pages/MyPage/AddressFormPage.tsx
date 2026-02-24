import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  loadAddresses,
  saveAddresses,
  applyDefault,
  generateAddressId,
  formatPhone,
  NORMAL_MEMO_OPTIONS,
  DAWN_MEMO_OPTIONS,
  type Address,
} from '../../store/addressStore'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CUSTOM = '기타(직접입력)'
const NONE   = '선택 안 함'

function memoOptionOf(memo: string | undefined, options: readonly string[]): string {
  if (!memo) return NONE
  if (options.includes(memo as never)) return memo
  return CUSTOM
}

function resolvedMemo(option: string, custom: string): string | undefined {
  if (option === NONE)   return undefined
  if (option === CUSTOM) return custom.trim() || undefined
  return option
}

// ─── InputRow ─────────────────────────────────────────────────────────────────

function InputRow({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-600">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900'

const selectCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddressFormPage() {
  const { addressId } = useParams<{ addressId: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(addressId)

  // Load existing address for edit mode
  const existing: Address | undefined = isEdit
    ? loadAddresses().find((a) => a.addressId === addressId)
    : undefined

  // ── Form state ──
  const [label,           setLabel]           = useState(existing?.label ?? '')
  const [receiverName,    setReceiverName]     = useState(existing?.receiverName ?? '')
  const [phone,           setPhone]           = useState(existing?.phone ?? '')
  const [zipCode,         setZipCode]         = useState(existing?.zipCode ?? '')
  const [address1,        setAddress1]        = useState(existing?.address1 ?? '')
  const [address2,        setAddress2]        = useState(existing?.address2 ?? '')
  const [normalOption,    setNormalOption]     = useState(
    memoOptionOf(existing?.normalDeliveryMemo, NORMAL_MEMO_OPTIONS)
  )
  const [normalCustom,    setNormalCustom]     = useState(
    normalOption === CUSTOM ? (existing?.normalDeliveryMemo ?? '') : ''
  )
  const [dawnOption,      setDawnOption]       = useState(
    memoOptionOf(existing?.dawnDeliveryMemo, DAWN_MEMO_OPTIONS)
  )
  const [dawnCustom,      setDawnCustom]       = useState(
    dawnOption === CUSTOM ? (existing?.dawnDeliveryMemo ?? '') : ''
  )
  const [isDefault,       setIsDefault]        = useState(existing?.isDefault ?? false)
  const [errors,          setErrors]           = useState<Partial<Record<string, string>>>({})

  // ── Validate ──
  function validate(): boolean {
    const errs: Partial<Record<string, string>> = {}
    if (!label.trim())        errs.label        = '배송지명을 입력해주세요.'
    if (!receiverName.trim()) errs.receiverName  = '받는 사람을 입력해주세요.'
    if (!phone.trim())        errs.phone         = '휴대폰 번호를 입력해주세요.'
    else if (phone.replace(/\D/g, '').length < 10) errs.phone = '올바른 번호를 입력해주세요.'
    if (!zipCode.trim())      errs.zipCode       = '우편번호를 입력해주세요.'
    if (!address1.trim())     errs.address1      = '주소를 입력해주세요.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Save ──
  function handleSave() {
    if (!validate()) return

    const now = new Date().toISOString()
    let addresses = loadAddresses()

    const newAddress: Address = {
      addressId:           isEdit ? (existing!.addressId) : generateAddressId(),
      label:               label.trim(),
      receiverName:        receiverName.trim(),
      phone,
      zipCode:             zipCode.trim(),
      address1:            address1.trim(),
      address2:            address2.trim(),
      normalDeliveryMemo:  resolvedMemo(normalOption, normalCustom),
      dawnDeliveryMemo:    resolvedMemo(dawnOption, dawnCustom),
      isDefault,
      createdAt:           isEdit ? existing!.createdAt : now,
      updatedAt:           now,
    }

    if (isEdit) {
      addresses = addresses.map((a) => (a.addressId === newAddress.addressId ? newAddress : a))
    } else {
      // 첫 번째 배송지는 자동으로 기본배송지
      if (addresses.length === 0) newAddress.isDefault = true
      addresses = [...addresses, newAddress]
    }

    // 기본배송지 단일 보장
    if (newAddress.isDefault) {
      addresses = applyDefault(addresses, newAddress.addressId)
    }

    saveAddresses(addresses)
    navigate('/mypage/address')
  }

  const pageTitle = isEdit ? '배송지 수정' : '배송지 추가'

  return (
    <div>
      {/* Back + title */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/mypage/address"
          className="flex items-center text-gray-400 transition-colors hover:text-gray-900"
          aria-label="배송지 목록으로"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">{pageTitle}</h2>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4">

        {/* 배송지명 */}
        <InputRow label="배송지명" required error={errors.label}>
          <input
            className={inputCls}
            placeholder="예: 집, 회사, 부모님댁"
            value={label}
            onChange={(e) => { setLabel(e.target.value); setErrors((p) => ({ ...p, label: undefined })) }}
          />
        </InputRow>

        {/* 받는 사람 */}
        <InputRow label="받는 사람" required error={errors.receiverName}>
          <input
            className={inputCls}
            placeholder="받는 사람"
            value={receiverName}
            onChange={(e) => { setReceiverName(e.target.value); setErrors((p) => ({ ...p, receiverName: undefined })) }}
          />
        </InputRow>

        {/* 우편번호 + 주소 */}
        <InputRow label="주소" required error={errors.zipCode || errors.address1}>
          <div className="flex gap-2">
            <input
              className={`${inputCls} w-32 shrink-0`}
              placeholder="우편번호"
              value={zipCode}
              onChange={(e) => { setZipCode(e.target.value); setErrors((p) => ({ ...p, zipCode: undefined })) }}
            />
            <button
              type="button"
              onClick={() => alert('우편번호 찾기는 준비 중입니다.')}
              className="shrink-0 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                </svg>
                찾기
              </span>
            </button>
          </div>
          <input
            className={inputCls}
            placeholder="기본 주소"
            value={address1}
            onChange={(e) => { setAddress1(e.target.value); setErrors((p) => ({ ...p, address1: undefined })) }}
          />
          <input
            className={inputCls}
            placeholder="상세 주소 (선택)"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
          />
        </InputRow>

        {/* 휴대폰 번호 */}
        <InputRow label="휴대폰 번호" required error={errors.phone}>
          <input
            className={inputCls}
            placeholder="010-0000-0000"
            inputMode="numeric"
            value={phone}
            onChange={(e) => {
              setPhone(formatPhone(e.target.value))
              setErrors((p) => ({ ...p, phone: undefined }))
            }}
          />
        </InputRow>

        {/* 일반배송 정보 */}
        <InputRow label="일반배송 정보">
          <select
            className={selectCls}
            value={normalOption}
            onChange={(e) => { setNormalOption(e.target.value); setNormalCustom('') }}
          >
            {NORMAL_MEMO_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          {normalOption === CUSTOM && (
            <input
              className={inputCls}
              placeholder="직접 입력해주세요"
              value={normalCustom}
              onChange={(e) => setNormalCustom(e.target.value)}
            />
          )}
        </InputRow>

        {/* 새벽배송 정보 */}
        <InputRow label="새벽배송 정보">
          <select
            className={selectCls}
            value={dawnOption}
            onChange={(e) => { setDawnOption(e.target.value); setDawnCustom('') }}
          >
            {DAWN_MEMO_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          {dawnOption === CUSTOM && (
            <input
              className={inputCls}
              placeholder="직접 입력해주세요"
              value={dawnCustom}
              onChange={(e) => setDawnCustom(e.target.value)}
            />
          )}
        </InputRow>

        {/* 기본 배송지 */}
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3.5 transition-colors hover:bg-gray-50">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          <span className="text-sm font-medium text-gray-700">기본 배송지로 선택</span>
        </label>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="mt-2 w-full rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[.99]"
        >
          저장
        </button>
      </div>
    </div>
  )
}
