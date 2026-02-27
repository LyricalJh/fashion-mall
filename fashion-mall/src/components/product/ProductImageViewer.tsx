import { useState, useRef, useCallback } from 'react'

export type ProductImage = {
  id: string
  url: string
  alt?: string
}

type Props = {
  images: ProductImage[]
}

function ImageZoomModal({ image, onClose }: { image: ProductImage; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.url}
          alt={image.alt ?? ''}
          className="max-h-[90vh] rounded-lg object-contain shadow-2xl"
        />
        <button
          onClick={onClose}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-800 hover:bg-white focus:outline-none"
          aria-label="닫기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function ProductImageViewer({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const isScrolling = useRef(false)

  const scrollTo = useCallback((index: number) => {
    if (!scrollRef.current) return
    isScrolling.current = true
    setActiveIndex(index)
    const container = scrollRef.current
    container.scrollTo({ left: index * container.clientWidth, behavior: 'smooth' })
    setTimeout(() => { isScrolling.current = false }, 400)
  }, [])

  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const handleScroll = useCallback(() => {
    if (isScrolling.current) return
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!scrollRef.current) return
      const container = scrollRef.current
      const newIndex = Math.round(container.scrollLeft / container.clientWidth)
      if (newIndex >= 0 && newIndex < images.length) {
        setActiveIndex(newIndex)
      }
    }, 80)
  }, [images.length])

  if (images.length === 0) return null

  return (
    <>
      <div className="relative aspect-square w-full max-w-[697px]">
        {/* Scrollable image strip */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scrollbar-hide"
        >
          {images.map((img, i) => (
            <div
              key={img.id}
              className="h-full w-full flex-none snap-start"
            >
              <button
                onClick={() => setIsZoomOpen(true)}
                className="group relative block h-full w-full cursor-zoom-in overflow-hidden bg-gray-100 focus:outline-none"
                aria-label="이미지 확대 보기"
              >
                <img
                  src={img.url}
                  alt={img.alt ?? ''}
                  className="h-full w-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Prev / Next arrows (desktop) */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
              className={`absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 shadow transition-opacity hover:bg-white md:flex ${activeIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              aria-label="이전 이미지"
            >
              <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollTo(Math.min(images.length - 1, activeIndex + 1))}
              className={`absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 shadow transition-opacity hover:bg-white md:flex ${activeIndex === images.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              aria-label="다음 이미지"
            >
              <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image counter badge */}
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white tabular-nums">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {isZoomOpen && (
        <ImageZoomModal image={images[activeIndex]} onClose={() => setIsZoomOpen(false)} />
      )}
    </>
  )
}
