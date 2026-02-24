import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadAddresses, type Address } from '../../store/addressStore'

// ─── AddressCard ──────────────────────────────────────────────────────────────

function AddressCard({ address, onEdit }: { address: Address; onEdit: () => void }) {
  const memoLine = [
    address.normalDeliveryMemo && `일반: ${address.normalDeliveryMemo}`,
    address.dawnDeliveryMemo   && `새벽: ${address.dawnDeliveryMemo}`,
  ]
    .filter(Boolean)
    .join(' / ')

  return (
    <div className="px-5 py-5">
      {/* Top row: label + pills + edit button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold text-gray-900">{address.label}</span>
          {address.isDefault && (
            <span className="rounded-full border border-gray-300 px-2 py-0.5 text-[11px] text-gray-500">
              기본배송지
            </span>
          )}
          {address.canRocketFresh && (
            <span className="rounded-full border border-green-500 px-2 py-0.5 text-[11px] text-green-600">
              로켓프레시 가능
            </span>
          )}
          {address.canRocketWow && (
            <span className="rounded-full border border-blue-500 px-2 py-0.5 text-[11px] text-blue-600">
              로켓와우 가능
            </span>
          )}
        </div>
        <button
          onClick={onEdit}
          className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-gray-50"
        >
          수정
        </button>
      </div>

      {/* Address */}
      <div className="mt-2 space-y-0.5 text-sm text-gray-700">
        <p>
          {address.address1}
          {address.address2 && `, ${address.address2}`}
        </p>
        <p>{address.phone}</p>
        {memoLine && <p className="text-gray-500">{memoLine}</p>}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddressPage() {
  const navigate = useNavigate()
  // 페이지 마운트 시 localStorage 재로드 (폼에서 돌아올 때 최신 반영)
  const [addresses] = useState<Address[]>(() =>
    [...loadAddresses()].sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
  )

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
          /* Address list */
          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {addresses.map((addr) => (
              <AddressCard
                key={addr.addressId}
                address={addr}
                onEdit={() => navigate(`/mypage/address/${addr.addressId}/edit`)}
              />
            ))}
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
