import { useEffect, useRef, useState } from 'react'
import { banners } from '../../mock/banners'

const GAP = 12 // px between panels

/** Returns how many panels are visible based on window width */
function useVisiblePanels() {
  const [count, setCount] = useState(() => {
    if (typeof window === 'undefined') return 3
    if (window.innerWidth < 768) return 1
    if (window.innerWidth < 1024) return 2
    return 3
  })

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) setCount(1)
      else if (window.innerWidth < 1024) setCount(2)
      else setCount(3)
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return count
}

const BADGE_COLORS: Record<string, string> = {
  NEW: 'bg-emerald-500',
  SALE: 'bg-rose-600',
  HOT: 'bg-red-500',
  BEST: 'bg-amber-500',
}

export default function HeroCarousel() {
  const total = banners.length
  const visiblePanels = useVisiblePanels()
  const maxIndex = total - visiblePanels

  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [panelWidth, setPanelWidth] = useState(0)

  // Measure panel width in px whenever viewport or visiblePanels changes
  useEffect(() => {
    const measure = () => {
      if (!viewportRef.current) return
      const containerW = viewportRef.current.offsetWidth
      const totalGap = GAP * (visiblePanels - 1)
      setPanelWidth((containerW - totalGap) / visiblePanels)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [visiblePanels])

  // Clamp current index when visible panel count changes on resize
  useEffect(() => {
    setCurrent((c) => Math.min(c, Math.max(0, total - visiblePanels)))
  }, [visiblePanels, total])

  // Auto-play timer — restarts whenever visiblePanels changes
  useEffect(() => {
    const max = total - visiblePanels
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c >= max ? 0 : c + 1))
    }, 4000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [visiblePanels, total])

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    const max = total - visiblePanels
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c >= max ? 0 : c + 1))
    }, 4000)
  }

  const goTo = (i: number) => { setCurrent(i); resetTimer() }
  const prev = () => { setCurrent((c) => Math.max(0, c - 1)); resetTimer() }
  const next = () => { setCurrent((c) => Math.min(maxIndex, c + 1)); resetTimer() }

  const translateX = panelWidth > 0 ? current * (panelWidth + GAP) : 0

  // Fallback panel width before JS measures (avoids layout jump)
  const cssWidth = panelWidth > 0
    ? `${panelWidth}px`
    : `calc((100% - ${GAP * (visiblePanels - 1)}px) / ${visiblePanels})`

  return (
    <div className="w-full px-4 py-4 md:px-6 lg:px-8">
      {/* Viewport — clips overflow */}
      <div ref={viewportRef} className="relative overflow-hidden">
        {/* Track */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ gap: `${GAP}px`, transform: `translateX(-${translateX}px)` }}
        >
          {banners.map((banner, idx) => (
            <div
              key={banner.id}
              className="relative shrink-0 overflow-hidden rounded-xl"
              style={{ width: cssWidth }}
            >
              <div className="relative aspect-[493/651]">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading={idx < visiblePanels ? 'eager' : 'lazy'}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                {/* Badge */}
                {banner.badgeText && (
                  <div className="absolute left-3 top-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-white ${BADGE_COLORS[banner.badgeText] ?? 'bg-gray-700'}`}
                    >
                      {banner.badgeText}
                    </span>
                  </div>
                )}

                {/* Text overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <h2 className="text-base font-black leading-snug text-white md:text-xl lg:text-2xl line-clamp-2">
                    {banner.title}
                  </h2>
                  {banner.subtitle && (
                    <p className="mt-1 text-xs text-white/75 md:text-sm line-clamp-1">
                      {banner.subtitle}
                    </p>
                  )}
                  <button className="mt-3 inline-flex items-center gap-1.5 rounded bg-white px-3.5 py-1.5 text-xs font-bold text-gray-900 transition hover:bg-gray-100 md:px-4 md:py-2 md:text-sm">
                    Shop Now
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Prev arrow */}
        <button
          onClick={prev}
          disabled={current === 0}
          aria-label="Previous"
          className="absolute left-2 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white disabled:opacity-30 disabled:cursor-default z-10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Next arrow */}
        <button
          onClick={next}
          disabled={current >= maxIndex}
          aria-label="Next"
          className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white disabled:opacity-30 disabled:cursor-default z-10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Dots — one dot per valid start position */}
      <div className="mt-3 flex justify-center gap-1.5">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-5 bg-gray-800' : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
