import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useProductLike } from '../../hooks/useLikes'
import type { CurationResponse, CurationProductItem } from '../../types/api'

interface CurationSectionProps {
  curation: CurationResponse
}

function LikeButton({ item }: { item: CurationProductItem }) {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const { liked, likeCount, isLoaded, toggleLike } = useProductLike(item.productId, item.likeCount ?? 0)

  const displayCount = isLoaded ? likeCount : (item.likeCount ?? 0)

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    toggleLike()
  }

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-center gap-0.5 px-1 shrink-0"
      aria-label={liked ? '좋아요 취소' : '좋아요'}
    >
      <svg
        className={`h-5 w-5 transition-colors ${liked ? 'text-rose-500' : 'text-gray-300 hover:text-gray-400'}`}
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {displayCount > 0 && (
        <span className="text-[10px] text-gray-400 leading-none">
          {displayCount > 999 ? `${Math.floor(displayCount / 1000)}k` : displayCount}
        </span>
      )}
    </button>
  )
}

export default function CurationSection({ curation }: CurationSectionProps) {
  const navigate = useNavigate()

  return (
    <div className="border-r border-b border-gray-200 p-7 overflow-hidden">
      {/* 대표 이미지 */}
      <div className="relative aspect-square overflow-hidden rounded bg-gray-100">
        <img
          src={curation.imageUrl}
          alt={curation.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* 타이틀 + 설명 */}
      <div className="mt-3">
        <h3 className="text-base font-bold text-gray-900">{curation.title}</h3>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed line-clamp-2">
          {curation.description}
        </p>
      </div>

      {/* 상품 카드 리스트 */}
      <ul className="mt-3 flex flex-col">
        {curation.products.map((item) => (
          <li
            key={item.productId}
            className="border-t border-gray-200 pt-2.5 pb-2.5 last:pb-0"
          >
            <div className="flex items-stretch gap-2 h-20">
              {/* 썸네일 80px */}
              <div
                className="relative aspect-square h-20 w-20 flex-none overflow-hidden rounded border border-gray-200 cursor-pointer"
                onClick={() => navigate(`/product/${item.productId}`)}
              >
                <img
                  src={item.thumbnailUrl ?? `https://picsum.photos/seed/${item.productId}/80/80`}
                  alt={item.productName}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {item.badgeText && (
                  <span className="absolute bottom-0 left-0 rounded-none bg-gray-900 px-1.5 py-0.5 text-[9px] font-bold text-white leading-tight">
                    {item.badgeText}
                  </span>
                )}
              </div>

              {/* 상품 정보 */}
              <div
                className="flex min-w-0 flex-1 flex-col justify-center cursor-pointer"
                onClick={() => navigate(`/product/${item.productId}`)}
              >
                <p className="text-xs font-bold text-gray-900 truncate">{item.brandName}</p>
                <p className="text-sm text-gray-700 truncate">{item.productName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {item.discountRate != null && item.discountRate > 0 && (
                    <span className="text-sm font-bold text-rose-500">{item.discountRate}%</span>
                  )}
                  <span className="text-sm font-bold text-gray-900">
                    {item.price.toLocaleString()}원
                  </span>
                </div>
                {/* 배송/뱃지 태그 */}
                {item.shippingInfo && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                      {item.shippingInfo}
                    </span>
                  </div>
                )}
              </div>

              {/* 좋아요 버튼 */}
              <LikeButton item={item} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
