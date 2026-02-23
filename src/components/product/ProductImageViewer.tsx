import { useState } from 'react'

export type ProductImage = {
  id: string
  url: string
  alt?: string
}

type Props = {
  images: ProductImage[]
}

function ThumbnailItem({
  image,
  isActive,
  onClick,
}: {
  image: ProductImage
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 overflow-hidden rounded border-2 transition-colors focus:outline-none ${
        isActive ? 'border-gray-900' : 'border-transparent hover:border-gray-300'
      }`}
    >
      <img
        src={image.url}
        alt={image.alt ?? ''}
        className="block h-20 w-14 object-cover md:h-24 md:w-16"
        loading="lazy"
      />
    </button>
  )
}

function ThumbnailList({
  images,
  activeIndex,
  onSelect,
}: {
  images: ProductImage[]
  activeIndex: number
  onSelect: (i: number) => void
}) {
  return (
    /* Mobile: horizontal scroll row — Desktop: vertical scrollable column */
    <div className="flex flex-row gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-x-visible md:overflow-y-auto md:pb-0">
      {images.map((img, i) => (
        <ThumbnailItem
          key={img.id}
          image={img}
          isActive={i === activeIndex}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  )
}

function MainImage({ image, onClick }: { image: ProductImage; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative block h-full w-full cursor-zoom-in overflow-hidden rounded-lg bg-gray-100 focus:outline-none"
      aria-label="이미지 확대 보기"
    >
      <img
        src={image.url}
        alt={image.alt ?? ''}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {/* Zoom hint icon */}
      <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-600 opacity-0 transition-opacity group-hover:opacity-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0zM11 8v6M8 11h6" />
        </svg>
      </span>
    </button>
  )
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

  if (images.length === 0) return null

  const activeImage = images[activeIndex]

  return (
    <>
      {/*
        Mobile  : flex-col  — thumbnails (horizontal scroll) on top, main image below
        Desktop : flex-row  — thumbnails (vertical list) on left, main image on right
      */}
      <div className="flex flex-col gap-3 md:flex-row md:gap-6">
        {/* Thumbnail column */}
        <div className="shrink-0 md:w-16">
          <ThumbnailList
            images={images}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
        </div>

        {/* Main image — aspect-[2/3] keeps portrait ratio */}
        <div className="aspect-[2/3] w-full md:flex-1">
          <MainImage image={activeImage} onClick={() => setIsZoomOpen(true)} />
        </div>
      </div>

      {isZoomOpen && (
        <ImageZoomModal image={activeImage} onClose={() => setIsZoomOpen(false)} />
      )}
    </>
  )
}
