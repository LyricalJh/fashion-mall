import { Link } from 'react-router-dom'
import type { Product } from '../../mock/products'
import Container from '../ui/Container'
import ProductGrid from './ProductGrid'

interface SectionBlockProps {
  title: string
  products: Product[]
  viewAllHref?: string
}

export default function SectionBlock({ title, products, viewAllHref }: SectionBlockProps) {
  return (
    <section className="py-10">
      <Container>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-xl font-black tracking-tight text-gray-900 md:text-2xl">{title}</h2>
          {viewAllHref && (
            <Link
              to={viewAllHref}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              View All
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
        <ProductGrid products={products} />
      </Container>
    </section>
  )
}
