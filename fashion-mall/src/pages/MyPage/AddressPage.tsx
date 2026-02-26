import { useNavigate } from 'react-router-dom'
import { useAddresses } from '../../hooks/useAddresses'
import type { AddressResponse } from '../../types/api'

// ─── AddressCard ──────────────────────────────────────────────────────────────

function DefaultAddressCard({
  address,
  onEdit,
}: {
  address: AddressResponse
  onEdit: () => void
}) {
  return (
    <div className="rounded-xl border-2 border-blue-500 bg-blue-50 px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold text-gray-900">{address.receiverName}</span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: '#3b82f6', color: '#fff' }}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            기본배송지
          </span>
        </div>
        <button
          onClick={onEdit}
          className="shrink-0 rounded-md border border-blue-300 px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-100"
        >
          수정
        </button>
      </div>
      <div className="mt-2 space-y-0.5 text-sm text-gray-700">
        <p>
          {address.address}
          {address.addressDetail && `, ${address.addressDetail}`}
        </p>
        <p>{address.receiverPhone}</p>
      </div>
    </div>
  )
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: AddressResponse
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
}) {
  return (
    <div className="px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold text-gray-900">{address.receiverName}</span>
          <button
            onClick={onSetDefault}
            className="rounded-full border border-dashed border-gray-300 px-2.5 py-0.5 text-xs text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-500"
          >
            기본으로 설정
          </button>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={onEdit}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-gray-50"
          >
            수정
          </button>
          <button
            onClick={onDelete}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      </div>
      <div className="mt-2 space-y-0.5 text-sm text-gray-700">
        <p>
          {address.address}
          {address.addressDetail && `, ${address.addressDetail}`}
        </p>
        <p>{address.receiverPhone}</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddressPage() {
  const navigate = useNavigate()
  const { addresses, isLoading, removeAddress, setDefault } = useAddresses()

  const defaultAddr = addresses.find((a) => a.isDefault)
  const otherAddrs = addresses.filter((a) => !a.isDefault)

  async function handleDelete(id: number) {
    if (!confirm('이 배송지를 삭제하시겠습니까?')) return
    try {
      await removeAddress(id)
    } catch {
      alert('배송지 삭제에 실패했습니다.')
    }
  }

  async function handleSetDefault(id: number) {
    try {
      await setDefault(id)
    } catch {
      alert('기본배송지 설정에 실패했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">배송지 관리</h2>

      <div className="mt-5">
        {addresses.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
            <svg
              className="mx-auto mb-3 h-10 w-10 text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <p className="text-sm font-medium text-gray-400">등록된 배송지가 없습니다.</p>
            <p className="mt-1 text-xs text-gray-300">자주 쓰는 배송지를 추가해 보세요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Default address - standalone card */}
            {defaultAddr && (
              <DefaultAddressCard
                address={defaultAddr}
                onEdit={() => navigate(`/mypage/address/${defaultAddr.id}/edit`)}
              />
            )}

            {/* Other addresses */}
            {otherAddrs.length > 0 && (
              <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
                {otherAddrs.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    onEdit={() => navigate(`/mypage/address/${addr.id}/edit`)}
                    onDelete={() => handleDelete(addr.id)}
                    onSetDefault={() => handleSetDefault(addr.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => navigate('/mypage/address/new')}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-4 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          배송지 추가
        </button>
      </div>
    </div>
  )
}
