import HeroCarousel from '../components/home/HeroCarousel'
import SectionBlock from '../components/home/SectionBlock'
import { useCategories } from '../hooks/useCategories'
import { useProducts } from '../hooks/useProducts'
import type { ProductSummary } from '../types/api'
import type { Product } from '../mock/products'

function toMockProduct(p: ProductSummary): Product {
  return {
    id: String(p.id),
    brand: p.categoryName,
    name: p.name,
    price: p.price,
    imageUrl: p.thumbnailUrl ?? `https://picsum.photos/seed/${p.id}/400/600`,
    colors: [],
    sizes: [],
  }
}

export default function HomePage() {
  const { categories } = useCategories()
  const { products, isLoading } = useProducts({ page: 0, size: 20 })

  if (isLoading) {
    return (
      <div>
        <HeroCarousel />
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      </div>
    )
  }

  // Group products by category (up to 4 categories, 4 products each)
  const sections = categories.slice(0, 4).map((cat) => {
    const catProducts = products
      .filter((p) => p.categoryId === cat.id)
      .slice(0, 4)
      .map(toMockProduct)
    return {
      key: String(cat.id),
      title: cat.name,
      products: catProducts,
      href: `/category/${cat.id}`,
    }
  }).filter((s) => s.products.length > 0)

  // Fallback: if no category-grouped products, show first 8 as single section
  const displaySections = sections.length > 0
    ? sections
    : products.length > 0
      ? [{ key: 'all', title: '추천 상품', products: products.slice(0, 8).map(toMockProduct), href: '/' }]
      : []

  return (
    <div>
      <HeroCarousel />
      <div className="divide-y divide-gray-100">
        {displaySections.map((sec) => (
          <SectionBlock
            key={sec.key}
            title={sec.title}
            products={sec.products}
            viewAllHref={sec.href}
          />
        ))}
      </div>
    </div>
  )
}
