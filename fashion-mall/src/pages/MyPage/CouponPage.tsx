export default function CouponPage() {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900">쿠폰/이용권</h2>
      <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
        <svg
          className="mx-auto mb-3 h-10 w-10 text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M20 12V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6" />
          <path d="M2 12h.01" />
          <path d="M22 12h.01" />
          <path d="M2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6" />
          <line x1="12" y1="7" x2="12" y2="17" strokeDasharray="2 2" />
        </svg>
        <p className="text-sm font-medium text-gray-400">보유 중인 쿠폰이 없습니다.</p>
        <p className="mt-1 text-xs text-gray-300">발급받은 쿠폰이 여기에 표시됩니다.</p>
      </div>
    </div>
  )
}
