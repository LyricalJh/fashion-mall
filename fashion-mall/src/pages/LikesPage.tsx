import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useMyLikes } from '../hooks/useLikes'
import Container from '../components/ui/Container'

export default function LikesPage() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const navigate = useNavigate()
  const { likes, isLoading } = useMyLikes()

  if (!isLoggedIn) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg
            className="h-16 w-16 text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="mt-4 text-gray-500">로그인 후 좋아요한 상품을 확인할 수 있습니다.</p>
          <Link
            to="/login"
            className="mt-4 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            로그인
          </Link>
        </div>
      </Container>
    )
  }

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="py-6">
        <h1 className="text-xl font-bold text-gray-900">좋아요</h1>
        <p className="mt-1 text-sm text-gray-500">{likes.length}개의 상품</p>
      </div>

      {likes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg
            className="h-16 w-16 text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="mt-4 text-gray-500">아직 좋아요한 상품이 없습니다.</p>
          <Link
            to="/"
            className="mt-4 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 pb-8 md:grid-cols-3 lg:grid-cols-4">
          {likes.map((product) => (
            <div
              key={product.productId}
              className="cursor-pointer group"
              onClick={() => navigate(`/product/${product.productId}`)}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={product.thumbnailUrl ?? `https://picsum.photos/seed/${product.productId}/300/300`}
                  alt={product.productName}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-2">
                <p className="text-xs font-bold text-gray-900 truncate">{product.brandName}</p>
                <p className="text-sm text-gray-700 truncate">{product.productName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {product.discountRate != null && product.discountRate > 0 && (
                    <span className="text-sm font-bold text-rose-500">{product.discountRate}%</span>
                  )}
                  <span className="text-sm font-bold text-gray-900">
                    {product.price.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}
