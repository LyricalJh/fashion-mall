import type { ProductColor } from '../../mock/products'

interface Props {
  open: boolean
  onClose: () => void
  colors: ProductColor[]
  sizes: string[]
  selectedColor: string | null
  selectedSize: string | null
  onChangeColor: (v: string) => void
  onChangeSize: (v: string) => void
  onConfirm: (action: 'BUY' | 'CART') => void
  validationError: string | null
}

export default function MobileOptionBottomSheet({
  open,
  onClose,
  colors,
  sizes,
  selectedColor,
  selectedSize,
  onChangeColor,
  onChangeSize,
  onConfirm,
  validationError,
}: Props) {
  const needsColor = colors.length >= 2
  const needsSize = sizes.length >= 2

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="옵션 선택"
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle bar */}
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Close button row */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <span className="text-base font-bold text-gray-900">옵션 선택</span>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="overflow-y-auto px-5 pb-5 pt-4"
          style={{ maxHeight: '55vh' }}
        >
          <div className="flex flex-col gap-5">
            {/* Color selector */}
            {needsColor && (
              <div>
                <p className="mb-2.5 text-sm font-medium text-gray-700">
                  색상
                  {selectedColor && (
                    <span className="ml-2 font-normal text-gray-400">{selectedColor}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => onChangeColor(color.name)}
                      aria-label={color.name}
                      title={color.name}
                      className={`relative h-9 w-9 rounded-full transition-transform active:scale-95 focus:outline-none ${
                        selectedColor === color.name
                          ? 'ring-2 ring-gray-900 ring-offset-2'
                          : 'ring-1 ring-gray-200'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {needsSize && (
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">사이즈</p>
                  <button className="text-xs text-gray-400 underline underline-offset-2">
                    사이즈 가이드
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => onChangeSize(size)}
                      className={`h-10 min-w-[52px] rounded-lg border px-3 text-sm font-medium transition-colors ${
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
            )}

            {/* Validation error */}
            {validationError && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
                {validationError}
              </p>
            )}
          </div>
        </div>

        {/* CTA buttons — always visible at bottom */}
        <div
          className="flex gap-3 border-t border-gray-100 px-5 pt-3"
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={() => onConfirm('CART')}
            className="flex-1 rounded-xl border border-gray-900 py-3.5 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-50 active:scale-[.98]"
          >
            장바구니 담기
          </button>
          <button
            onClick={() => onConfirm('BUY')}
            className="flex-1 rounded-xl bg-gray-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-gray-700 active:scale-[.98]"
          >
            바로 구매하기
          </button>
        </div>
      </div>
    </>
  )
}
