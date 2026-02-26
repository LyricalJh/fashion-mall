import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAddresses } from '../../hooks/useAddresses'
import { formatPhone } from '../../store/addressStore'

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddressFormPage() {
  const { addressId } = useParams<{ addressId: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(addressId)
  const { addresses, addAddress, updateAddress } = useAddresses()

  // Load existing address for edit mode
  const existing = isEdit
    ? addresses.find((a) => a.id === Number(addressId))
    : undefined

  // ── Form state ──
  const [receiverName,    setReceiverName]     = useState(existing?.receiverName ?? '')
  const [receiverPhone,   setReceiverPhone]    = useState(existing?.receiverPhone ?? '')
  const [zipCode,         setZipCode]         = useState(existing?.zipCode ?? '')
  const [address,         setAddress]         = useState(existing?.address ?? '')
  const [addressDetail,   setAddressDetail]   = useState(existing?.addressDetail ?? '')
  const [isDefault,       setIsDefault]        = useState(existing?.isDefault ?? false)
  const [errors,          setErrors]           = useState<Partial<Record<string, string>>>({})
  const [saving,          setSaving]           = useState(false)

  // ── Validate ──
  function validate(): boolean {
    const errs: Partial<Record<string, string>> = {}
    if (!receiverName.trim()) errs.receiverName  = '받는 사람을 입력해주세요.'
    if (!receiverPhone.trim())        errs.receiverPhone         = '휴대폰 번호를 입력해주세요.'
    else if (receiverPhone.replace(/\D/g, '').length < 10) errs.receiverPhone = '올바른 번호를 입력해주세요.'
    if (!zipCode.trim())      errs.zipCode       = '우편번호를 입력해주세요.'
    if (!address.trim())     errs.address      = '주소를 입력해주세요.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Save ──
  async function handleSave() {
    if (!validate() || saving) return
    setSaving(true)

    const body = {
      receiverName: receiverName.trim(),
      receiverPhone,
      zipCode: zipCode.trim(),
      address: address.trim(),
      addressDetail: addressDetail.trim(),
      isDefault,
    }

    try {
      if (isEdit && addressId) {
        await updateAddress(Number(addressId), body)
      } else {
        await addAddress(body)
      }
      navigate('/mypage/address')
    } catch {
      alert('배송지 저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
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

        {/* 받는 사람 */}
        <InputRow label="받는 사람" required error={errors.receiverName}>
          <input
            className={inputCls}
            placeholder="받는 사람"
            value={receiverName}
            onChange={(e) => { setReceiverName(e.target.value); setErrors((p) => ({ ...p, receiverName: undefined })) }}
          />
        </InputRow>

        {/* 휴대폰 번호 */}
        <InputRow label="휴대폰 번호" required error={errors.receiverPhone}>
          <input
            className={inputCls}
            placeholder="010-0000-0000"
            inputMode="numeric"
            value={receiverPhone}
            onChange={(e) => {
              setReceiverPhone(formatPhone(e.target.value))
              setErrors((p) => ({ ...p, receiverPhone: undefined }))
            }}
          />
        </InputRow>

        {/* 우편번호 + 주소 */}
        <InputRow label="주소" required error={errors.zipCode || errors.address}>
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
            value={address}
            onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: undefined })) }}
          />
          <input
            className={inputCls}
            placeholder="상세 주소 (선택)"
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
          />
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
          disabled={saving}
          className="mt-2 w-full rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[.99] disabled:opacity-60"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
