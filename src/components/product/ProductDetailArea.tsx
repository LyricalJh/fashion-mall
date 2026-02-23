import { useRef, useState, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionId = 'info' | 'size' | 'care' | 'shipping'

interface DetailImage {
  url: string
  alt: string
  caption?: string
}

interface DetailSpec {
  term: string
  detail: string
}

interface DetailSection {
  id: SectionId
  label: string
  title: string
  /** Short descriptor rendered above bullets/images */
  lead?: string
  /** Side-by-side (bullets left, images right) layout on md+ */
  hybrid?: boolean
  bullets?: string[]
  paragraphs?: string[]
  images?: DetailImage[]
  specs?: DetailSpec[]
  table?: { headers: string[]; rows: (string | number)[][] }
}

// ─── Mock Content ─────────────────────────────────────────────────────────────

const DETAIL_SECTIONS: DetailSection[] = [
  {
    id: 'info',
    label: '상품정보',
    title: '상품 정보',
    hybrid: true,
    lead: '트렌디한 핏과 고급 소재로 완성된 시즌리스 드레스입니다. 데일리부터 특별한 날까지 다양하게 연출할 수 있습니다.',
    bullets: [
      '고급 폴리에스터 혼방 소재로 구김이 적고 드레이프감이 우수합니다.',
      '몸매 라인을 자연스럽게 살려주는 세미 피티드 실루엣입니다.',
      '뒷 지퍼 디테일로 착탈이 편리하며 깔끔한 마무리를 더합니다.',
      '안감이 전체적으로 들어가 비침 걱정 없이 착용할 수 있습니다.',
    ],
    images: [
      {
        url: 'https://picsum.photos/seed/detail-a/700/900',
        alt: '상품 상세 이미지 1',
        caption: '세련된 실루엣과 디테일',
      },
      {
        url: 'https://picsum.photos/seed/detail-b/700/500',
        alt: '상품 상세 이미지 2',
        caption: '다양한 코디에 활용 가능한 디자인',
      },
    ],
    specs: [
      { term: '제조국', detail: '대한민국' },
      { term: '핏', detail: '세미 피티드' },
      { term: '기장', detail: '미디 (무릎 아래 10 cm)' },
      { term: '안감', detail: '있음 (전체 안감)' },
      { term: '신축성', detail: '없음' },
      { term: '비침', detail: '없음' },
    ],
  },
  {
    id: 'size',
    label: '사이즈',
    title: '사이즈 가이드',
    lead: '실측 사이즈를 측정하여 아래 표와 비교 후 구매하시기 바랍니다. 모델은 170 cm / S 사이즈 착용입니다.',
    bullets: [
      '허리 치수를 기준으로 사이즈를 선택하세요.',
      '신축성이 없으므로 여유분을 고려해 선택하시기 바랍니다.',
      '기장이 긴 미디 기장으로, 키에 따라 길이감이 달라질 수 있습니다.',
    ],
    table: {
      headers: ['사이즈', '가슴 (cm)', '허리 (cm)', '엉덩이 (cm)', '총기장 (cm)'],
      rows: [
        ['XS', '80 ~ 83', '60 ~ 63', '86 ~ 89', '95'],
        ['S',  '84 ~ 87', '64 ~ 67', '90 ~ 93', '96'],
        ['M',  '88 ~ 91', '68 ~ 71', '94 ~ 97', '97'],
        ['L',  '92 ~ 95', '72 ~ 75', '98 ~ 101', '98'],
        ['XL', '96 ~ 99', '76 ~ 79', '102 ~ 105', '99'],
      ],
    },
  },
  {
    id: 'care',
    label: '소재/세탁',
    title: '소재 및 세탁 안내',
    bullets: [
      '손세탁 또는 세탁기 약세탁 (30°C 이하 찬물)',
      '단독 세탁 또는 유사한 색상끼리 세탁',
      '표백제 사용 금지',
      '건조기 사용 금지 — 그늘에서 뉘어서 건조',
      '다림질 필요 시 안감에서 저온으로 (110°C 이하)',
      '드라이클리닝 가능',
    ],
    paragraphs: [
      '세탁 시 뒤집어서 세탁망에 넣어 세탁하시면 원단과 색상을 오래 유지할 수 있습니다.',
    ],
    specs: [
      { term: '겉감', detail: '폴리에스터 95%, 엘라스테인 5%' },
      { term: '안감', detail: '폴리에스터 100%' },
      { term: '원단 특성', detail: '광택감, 드레이프성 우수, 구김 적음' },
    ],
  },
  {
    id: 'shipping',
    label: '배송/교환',
    title: '배송 및 교환·반품 안내',
    lead: '주문 완료 후 영업일 기준 1~2일 이내 발송됩니다. 주말 및 공휴일은 배송이 지연될 수 있습니다.',
    bullets: [
      '교환·반품 신청: 상품 수령 후 7일 이내',
      '제품 하자 또는 오배송의 경우 배송비 무료',
      '단순 변심 반품 시 편도 배송비 3,000원 고객 부담',
      '착용 후, 세탁 후, 또는 태그 제거 후에는 교환·반품 불가',
    ],
    specs: [
      { term: '배송 방법', detail: 'CJ대한통운 택배' },
      { term: '배송비', detail: '무료 (3만원 이상) / 3,000원 (미만)' },
      { term: '도서 산간', detail: '추가 배송비 3,000 ~ 5,000원' },
      { term: '평균 배송일', detail: '영업일 기준 2~3일' },
    ],
  },
]

// ─── SectionBlock ─────────────────────────────────────────────────────────────

interface SectionBlockProps {
  section: DetailSection
  ref?: React.Ref<HTMLElement>
}

function SectionBlock({ section, ref }: SectionBlockProps) {
  const hasHybrid = section.hybrid && section.images && section.bullets

  return (
    <article
      ref={ref}
      data-section={section.id}
      className="border-b border-gray-100 py-12 last:border-b-0 md:py-16"
    >
      {/* Heading */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 md:text-xl">{section.title}</h3>
        <div className="mt-2 h-0.5 w-8 bg-rose-500" />
      </div>

      {/* Lead */}
      {section.lead && (
        <p className="mb-7 max-w-2xl text-base leading-relaxed text-gray-600">{section.lead}</p>
      )}

      {/* Hybrid: bullets (left) + images (right) */}
      {hasHybrid ? (
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Bullets column */}
          <ul className="flex flex-col gap-3.5">
            {section.bullets!.map((b, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-gray-600">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400"
                  aria-hidden="true"
                />
                {b}
              </li>
            ))}
          </ul>

          {/* Images column */}
          <div className="flex flex-col gap-4">
            {section.images!.map((img, i) => (
              <figure key={i} className="overflow-hidden rounded-xl">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full object-cover"
                  loading="lazy"
                />
                {img.caption && (
                  <figcaption className="mt-2 text-center text-xs text-gray-400">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Standard bullets */}
          {section.bullets && (
            <ul className="mb-6 flex flex-col gap-3.5">
              {section.bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-gray-600">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400"
                    aria-hidden="true"
                  />
                  {b}
                </li>
              ))}
            </ul>
          )}

          {/* Non-hybrid images */}
          {section.images && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {section.images.map((img, i) => (
                <figure key={i} className="overflow-hidden rounded-xl">
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                  {img.caption && (
                    <figcaption className="mt-2 text-center text-xs text-gray-400">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </>
      )}

      {/* Paragraphs (notes / supplementary text) */}
      {section.paragraphs && (
        <div className="mb-6 flex flex-col gap-3">
          {section.paragraphs.map((p, i) => (
            <p key={i} className="rounded-lg bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-600">
              {p}
            </p>
          ))}
        </div>
      )}

      {/* Size table */}
      {section.table && (
        <div className="mb-8 overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {section.table.headers.map((h, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${
                      i === 0 ? 'text-left' : 'text-center'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {section.table.rows.map((row, ri) => (
                <tr key={ri} className="transition-colors hover:bg-gray-50/70">
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-4 py-3 ${
                        ci === 0
                          ? 'font-semibold text-gray-900'
                          : 'text-center text-gray-600'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Specs definition list */}
      {section.specs && (
        <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
          {section.specs.map((spec, i) => (
            <div key={i} className="flex gap-4 border-b border-gray-100 py-3 last:border-b-0">
              <dt className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {spec.term}
              </dt>
              <dd className="text-sm text-gray-700">{spec.detail}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  )
}

// ─── ProductDetailArea ────────────────────────────────────────────────────────

interface ProductDetailAreaProps {
  productId: string
}

export default function ProductDetailArea({ productId: _productId }: ProductDetailAreaProps) {
  const [activeId, setActiveId] = useState<SectionId>('info')
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({})
  const tabsBarRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver — highlight active tab while scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost entry that is intersecting
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (intersecting.length > 0) {
          const id = intersecting[0].target.getAttribute('data-section') as SectionId
          if (id) setActiveId(id)
        }
      },
      {
        // top: below header (64px) + tabs bar (~46px) = ~110px; bottom: keep only top ~40%
        rootMargin: '-112px 0px -55% 0px',
        threshold: 0,
      },
    )

    const refs = sectionRefs.current
    Object.values(refs).forEach((el) => {
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // Smooth-scroll to section, accounting for sticky header + tabs
  const scrollToSection = (id: SectionId) => {
    const el = sectionRefs.current[id]
    if (!el) return
    const tabsHeight = tabsBarRef.current?.offsetHeight ?? 46
    const headerHeight = 64
    const offset = headerHeight + tabsHeight + 8
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveId(id)
  }

  return (
    <section className="mt-16 border-t border-gray-200">
      {/* ── Section heading ── */}
      <div className="py-10 text-center md:py-14">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">상품상세</h2>
        <div className="mx-auto mt-3 h-0.5 w-10 bg-rose-500" />
      </div>

      {/* ── Sticky tab navigation ── */}
      <div
        ref={tabsBarRef}
        className="sticky top-16 z-30 border-b border-gray-200 bg-white shadow-sm"
      >
        <div className="mx-auto w-full max-w-screen-xl px-4 md:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {DETAIL_SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`shrink-0 whitespace-nowrap border-b-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                  activeId === s.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section content ── */}
      <div className="mx-auto w-full max-w-screen-xl px-4 md:px-6 lg:px-8">
        {DETAIL_SECTIONS.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            ref={(el: HTMLElement | null) => {
              sectionRefs.current[section.id] = el
            }}
          />
        ))}
      </div>
    </section>
  )
}
