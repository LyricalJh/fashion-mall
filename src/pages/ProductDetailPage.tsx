import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Container from '../components/ui/Container'
import ProductImageViewer, { type ProductImage } from '../components/product/ProductImageViewer'
import Badge from '../components/ui/Badge'
import Price from '../components/ui/Price'
import Button from '../components/ui/Button'
import { useStore } from '../store/useStore'
import { products } from '../mock/products'

const SIZES = ['XS', 'S', 'M', 'L', 'XL']

export default function ProductDetailPage() {
  const { id } = useParams()
  const product = products.find((p) => p.id === id)
  const { favorites, toggleFavorite, incrementCart } = useStore()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  if (!product) {
    return (
      <Container className="py-16 text-center">
        <p className="text-gray-500">상품을 찾을 수 없습니다.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-rose-600 hover:underline">
          홈으로 돌아가기
        </Link>
      </Container>
    )
  }

  const isFav = favorites.has(product.id)

  // Generate 4 demo images from the product's base image + seed variants
  const images: ProductImage[] = [
    { id: '1', url: product.imageUrl, alt: product.name },
    { id: '2', url: `https://picsum.photos/seed/${product.id}-b/400/600`, alt: product.name },
    { id: '3', url: `https://picsum.photos/seed/${product.id}-c/400/600`, alt: product.name },
    { id: '4', url: `https://picsum.photos/seed/${product.id}-d/400/600`, alt: product.name },
  ]

  return (
    <Container className="py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500" aria-label="breadcrumb">
        <Link to="/" className="hover:text-gray-900 transition-colors">홈</Link>
        <span aria-hidden="true">/</span>
        <span className="text-gray-900">{product.brand}</span>
      </nav>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Left — Image viewer */}
        <ProductImageViewer images={images} />

        {/* Right — Product info */}
        <div className="flex flex-col gap-5">
          {/* Badge */}
          {product.badge && (
            <div>
              <Badge
                label={product.badge}
                variant={product.badge.toLowerCase() as 'hot' | 'new' | 'best' | 'sale'}
              />
            </div>
          )}

          {/* Brand & name */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {product.brand}
            </p>
            <h1 className="mt-1.5 text-2xl font-bold text-gray-900 md:text-3xl">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="border-t border-gray-100 pt-4">
            <Price
              price={product.price}
              originalPrice={product.originalPrice}
              discountRate={product.discountRate}
            />
          </div>

          {/* Size selector */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">사이즈</p>
              <button className="text-xs text-gray-400 underline hover:text-gray-600">
                사이즈 가이드
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`h-10 min-w-[44px] rounded border px-3 text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-gray-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <Button size="lg" variant="outline" className="flex-1" onClick={() => incrementCart()}>
              장바구니 담기
            </Button>
            <Button size="lg" className="flex-1">
              바로 구매
            </Button>
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded border transition-colors focus:outline-none ${
                isFav
                  ? 'border-rose-500 text-rose-500'
                  : 'border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-700'
              }`}
              aria-label={isFav ? '찜 해제' : '찜하기'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill={isFav ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={isFav ? 0 : 1.5}
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Product description */}
          <div className="border-t border-gray-100 pt-4 text-sm leading-relaxed text-gray-500">
            <p>고급 소재로 제작된 세련된 스타일의 {product.name}입니다.</p>
            <p className="mt-1">다양한 코디에 활용 가능하며 시즌리스 아이템으로 추천드립니다.</p>
          </div>

          {/* Shipping info */}
          <div className="rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500">
            <p>• 무료배송 (3만원 이상 구매 시)</p>
            <p className="mt-1">• 영업일 기준 2~3일 내 출고</p>
            <p className="mt-1">• 교환 및 반품: 수령 후 7일 이내</p>
          </div>
        </div>
      </div>
    </Container>
  )
}
