import HeroCarousel from '../components/home/HeroCarousel'
import SectionBlock from '../components/home/SectionBlock'
import { products } from '../mock/products'
import { sections } from '../mock/sections'

export default function HomePage() {
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))

  return (
    <div>
      <HeroCarousel />
      <div className="divide-y divide-gray-100">
        {sections.map((sec) => {
          const sectionProducts = sec.productIds
            .map((id) => productMap[id])
            .filter(Boolean)
          return (
            <SectionBlock
              key={sec.key}
              title={sec.title}
              products={sectionProducts}
              viewAllHref={`/category/${sec.key}`}
            />
          )
        })}
      </div>
    </div>
  )
}
