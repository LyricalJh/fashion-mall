import { useNavigate, useLocation } from 'react-router-dom'
import type { Product } from '../../mock/products'
import { useStore } from '../../store/useStore'
import { useAuthStore } from '../../store/authStore'
import Badge from '../ui/Badge'
import Price from '../ui/Price'

interface ProductCardProps {
  product: Product
}

const badgeVariantMap: Record<string, 'hot' | 'new' | 'best' | 'sale'> = {
  HOT: 'hot',
  NEW: 'new',
  BEST: 'best',
  SALE: 'sale',
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const favorites = useStore((s) => s.favorites)
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const isFav = favorites.has(product.id)

  function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    toggleFavorite(product.id)
  }

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg bg-gray-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badge */}
        {product.badge && (
          <div className="absolute left-2 top-2">
            <Badge label={product.badge} variant={badgeVariantMap[product.badge]} />
          </div>
        )}
        {/* Heart */}
        <button
          onClick={handleFavorite}
          aria-label={isFav ? '찜 해제' : '찜하기'}
          className="absolute bottom-2 right-2 rounded-full bg-white/90 p-1.5 shadow transition hover:bg-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isFav ? '#f43f5e' : 'none'}
            stroke={isFav ? '#f43f5e' : '#6b7280'}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5 rounded-lg" />
      </div>

      {/* Info */}
      <div className="mt-2 px-0.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{product.brand}</p>
        <p className="mt-0.5 text-sm font-medium text-gray-800 line-clamp-1">{product.name}</p>
        <div className="mt-1">
          <Price price={product.price} originalPrice={product.originalPrice} discountRate={product.discountRate} />
        </div>
      </div>
    </div>
  )
}
