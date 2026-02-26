import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { apiDelete } from '../../lib/apiClient'

export default function WithdrawPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleWithdraw = async () => {
    if (!confirmed) return
    setLoading(true)
    setError('')
    try {
      await apiDelete('/auth/withdraw')
      logout()
      navigate('/', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : '회원탈퇴에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900">회원탈퇴</h2>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm font-medium text-gray-700">탈퇴 전 꼭 확인하세요</p>
        <ul className="mt-3 space-y-2 text-sm text-gray-500">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-rose-400">•</span>
            탈퇴 시 보유 중인 쿠폰, 적립금은 즉시 소멸됩니다.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-rose-400">•</span>
            주문/배송 중인 상품이 있는 경우 탈퇴가 제한될 수 있습니다.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-rose-400">•</span>
            탈퇴 후 동일 계정으로 재가입 시 기존 혜택이 복원되지 않습니다.
          </li>
        </ul>

        <label className="mt-6 flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
          />
          위 내용을 모두 확인했으며 탈퇴에 동의합니다.
        </label>

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

        <button
          disabled={!confirmed || loading}
          onClick={handleWithdraw}
          className="mt-4 w-full rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-rose-300 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? '처리 중...' : '회원탈퇴 신청'}
        </button>
      </div>
    </div>
  )
}
