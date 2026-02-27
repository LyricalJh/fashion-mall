import { banners } from '../mock/banners'
import CurationSection from '../components/home/CurationSection'
import { useCurations } from '../hooks/useCurations'

export default function HomePage() {
  const { curations, isLoading } = useCurations()

  return (
    <div>
      {/* ── Mobile: 가로 스크롤 배너 strip ── */}
      <div className="md:hidden overflow-x-auto flex gap-3 px-4 py-4 scrollbar-hide">
        {banners.map((b) => (
          <div
            key={b.id}
            className="flex-none w-[70vw] aspect-[5/6] rounded-xl overflow-hidden relative"
          >
            <img
              src={b.imageUrl}
              alt={b.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h2 className="text-sm font-bold leading-snug text-white line-clamp-2">
                {b.title}
              </h2>
              {b.subtitle && (
                <p className="mt-0.5 text-[11px] text-white/70 line-clamp-1">{b.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop: 2컬럼 레이아웃 ── */}
      <div className="hidden md:flex md:flex-row items-start px-6 lg:px-8 py-6 gap-6">
        {/* 좌측 44% — 배너 이미지 세로 나열 */}
        <div className="w-[44%]">
          {banners.map((b) => (
            <div
              key={b.id}
              className="aspect-[5/6] overflow-hidden relative group cursor-pointer"
            >
              <img
                src={b.imageUrl}
                alt={b.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-7xl font-bold leading-tight text-white line-clamp-2">
                  {b.title}
                </h2>
                {b.subtitle && (
                  <p className="mt-2 text-2xl text-white/75 line-clamp-1">{b.subtitle}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 우측 56% — 기획전 에디토리얼 2컬럼 그리드 */}
        <div className="w-[56%]">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
            </div>
          ) : curations.length > 0 ? (
            <div className="grid grid-cols-2 border-l border-t border-gray-200">
              {curations.map((c) => (
                <CurationSection key={c.id} curation={c} />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Mobile: 기획전 섹션 (stacked) ── */}
      {!isLoading && curations.length > 0 && (
        <div className="md:hidden divide-y divide-gray-200 px-4">
          {curations.map((c) => (
            <CurationSection key={c.id} curation={c} />
          ))}
        </div>
      )}
    </div>
  )
}
