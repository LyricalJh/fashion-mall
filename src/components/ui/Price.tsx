interface PriceProps {
  price: number
  originalPrice?: number
  discountRate?: number
}

function formatKRW(n: number) {
  return n.toLocaleString('ko-KR') + '원'
}

export default function Price({ price, originalPrice, discountRate }: PriceProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1.5">
        {discountRate && (
          <span className="text-sm font-bold text-rose-600">{discountRate}%</span>
        )}
        <span className="text-base font-bold text-gray-900">{formatKRW(price)}</span>
      </div>
      {originalPrice && (
        <span className="text-xs text-gray-400 line-through">{formatKRW(originalPrice)}</span>
      )}
    </div>
  )
}
