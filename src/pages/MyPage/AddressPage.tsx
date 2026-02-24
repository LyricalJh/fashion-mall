export default function AddressPage() {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900">배송지 변경</h2>
      <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
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
    </div>
  )
}
