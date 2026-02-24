import { useParams, Link } from 'react-router-dom'
import { MOCK_CLAIMS } from '../../mock/claims'

export default function ClaimDetailPage() {
  const { claimId } = useParams()
  const claim = MOCK_CLAIMS.find((c) => c.claimId === claimId)

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/mypage/returns"
          className="flex items-center text-gray-400 transition-colors hover:text-gray-900"
          aria-label="목록으로"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-xl font-bold text-gray-900">
          {claim ? `${claim.claimType} 상세` : '상세 정보'}
        </h2>
      </div>

      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
        <p className="text-sm font-medium text-gray-400">상세 페이지 준비 중</p>
        {claimId && <p className="mt-1 text-xs text-gray-300">{claimId}</p>}
      </div>
    </div>
  )
}
