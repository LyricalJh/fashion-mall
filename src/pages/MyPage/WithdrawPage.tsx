export default function WithdrawPage() {
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
        <button
          className="mt-6 w-full rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-rose-300 hover:text-rose-500"
          onClick={() => alert('회원탈퇴 기능은 준비 중입니다.')}
        >
          회원탈퇴 신청
        </button>
      </div>
    </div>
  )
}
