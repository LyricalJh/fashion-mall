import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../../mock/products'
import { useStore } from '../../store/useStore'
import MobileOptionBottomSheet from './MobileOptionBottomSheet'

interface Props {
  product: Product
  onShowToast: (msg: string, action?: { label: string; onClick: () => void }) => void
}

/** 색상 선택이 필요한지 (2개 이상이어야 선택 필요) */
function needsColorSelection(product: Product) {
  return product.colors.length >= 2
}

/** 사이즈 선택이 필요한지 */
function needsSizeSelection(product: Product) {
  return product.sizes.length >= 2
}

/** 옵션 선택이 하나라도 필요한지 */
function needsOptionSelection(product: Product) {
  return needsColorSelection(product) || needsSizeSelection(product)
}

/** 현재 선택값 검증 → 오류 메시지 or null */
function validateSelections(
  product: Product,
  selectedColor: string | null,
  selectedSize: string | null,
): string | null {
  const noColor = needsColorSelection(product) && !selectedColor
  const noSize = needsSizeSelection(product) && !selectedSize
  if (noColor && noSize) return '컬러와 사이즈를 선택해주세요.'
  if (noColor) return '컬러를 선택해주세요.'
  if (noSize) return '사이즈를 선택해주세요.'
  return null
}

export default function MobileProductActionBar({ product, onShowToast }: Props) {
  const navigate = useNavigate()
  const { addToCart, favorites, toggleFavorite } = useStore()
  const isFav = favorites.has(product.id)

  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // 옵션이 1개뿐이면 자동 선택
  useEffect(() => {
    setSelectedColor(product.colors.length === 1 ? product.colors[0].name : null)
    setSelectedSize(product.sizes.length === 1 ? product.sizes[0] : null)
    setValidationError(null)
  }, [product.id])

  function buildCartItem() {
    const color = selectedColor ?? (product.colors.length === 1 ? product.colors[0].name : null)
    const size = selectedSize ?? (product.sizes.length === 1 ? product.sizes[0] : null)
    const parts = [size && `사이즈: ${size}`, color && `컬러: ${color}`].filter(Boolean)
    const optionText = parts.length ? parts.join(' / ') : '기본 옵션'
    const itemId = `${product.id}-${color ?? 'default'}-${size ?? 'default'}`
    return {
      id: itemId,
      brand: product.brand,
      name: product.name,
      optionText,
      imageUrl: product.imageUrl,
      price: product.price,
      originalPrice: product.originalPrice,
      discountRate: product.discountRate,
      quantity: 1,
      selected: true,
    }
  }

  function executeAction(action: 'BUY' | 'CART') {
    if (action === 'CART') {
      addToCart(buildCartItem())
      onShowToast('장바구니에 담겼어요', {
        label: '장바구니 바로 가기',
        onClick: () => navigate('/cart'),
      })
      setSheetOpen(false)
    } else {
      // 바로 구매: 장바구니에 추가하지 않고 상품 정보를 직접 전달
      navigate('/checkout', { state: { directItem: buildCartItem() } })
    }
  }

  function handleCTAClick(action: 'BUY' | 'CART') {
    if (needsOptionSelection(product)) {
      setValidationError(null)
      setSheetOpen(true)
    } else {
      executeAction(action)
    }
  }

  function handleSheetConfirm(action: 'BUY' | 'CART') {
    const error = validateSelections(product, selectedColor, selectedSize)
    if (error) {
      setValidationError(error)
      return
    }
    setValidationError(null)
    setSheetOpen(false)
    executeAction(action)
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: `${product.brand} — ${product.name}`, url })
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        onShowToast('링크가 복사되었습니다')
      } catch {
        onShowToast('링크 복사에 실패했습니다')
      }
    }
  }

  return (
    <>
      <MobileOptionBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        colors={product.colors}
        sizes={product.sizes}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        onChangeColor={(v) => { setSelectedColor(v); setValidationError(null) }}
        onChangeSize={(v) => { setSelectedSize(v); setValidationError(null) }}
        onConfirm={handleSheetConfirm}
        validationError={validationError}
      />

      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t border-gray-200 bg-white px-4 pt-3 md:hidden"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        {/* Icon buttons */}
        <div className="flex items-center gap-0.5">
          {/* 찜 */}
          <button
            onClick={() => toggleFavorite(product.id)}
            aria-label={isFav ? '찜 해제' : '찜하기'}
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
              isFav ? 'text-rose-500' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill={isFav ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={isFav ? 0 : 1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {/* 공유 */}
          <button
            onClick={handleShare}
            aria-label="공유하기"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 transition-colors hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>

          {/* 장바구니 */}
          <button
            onClick={() => handleCTAClick('CART')}
            aria-label="장바구니 담기"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 transition-colors hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </button>
        </div>

        {/* 구매하기 CTA */}
        <button
          onClick={() => handleCTAClick('BUY')}
          className="flex flex-1 items-center justify-center rounded-xl bg-gray-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-gray-700 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          구매하기
        </button>
      </div>
    </>
  )
}
