export default function OrderListPage() {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900">주문목록/배송조회</h2>
      <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
        <svg
          className="mx-auto mb-3 h-10 w-10 text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        <p className="text-sm font-medium text-gray-400">최근 주문 내역이 없습니다.</p>
        <p className="mt-1 text-xs text-gray-300">주문하신 상품이 여기에 표시됩니다.</p>
      </div>
    </div>
  )
}
