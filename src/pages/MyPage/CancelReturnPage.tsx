export default function CancelReturnPage() {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900">취소/반품/교환/환불 내역</h2>
      <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
        <svg
          className="mx-auto mb-3 h-10 w-10 text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
        </svg>
        <p className="text-sm font-medium text-gray-400">취소/반품/교환/환불 내역이 없습니다.</p>
        <p className="mt-1 text-xs text-gray-300">처리된 내역이 여기에 표시됩니다.</p>
      </div>
    </div>
  )
}
