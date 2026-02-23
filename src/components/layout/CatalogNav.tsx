import { useState } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../../mock/categories'
import Container from '../ui/Container'

export default function CatalogNav() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <nav className="border-b border-gray-100 bg-white">
        <Container>
          {/* Desktop nav */}
          <ul className="hidden md:flex md:gap-6 md:py-3">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/category/${cat.slug}`}
                  className="whitespace-nowrap text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Mobile hamburger */}
          <div className="flex items-center py-3 md:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              카테고리
            </button>
          </div>
        </Container>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <span className="font-bold text-gray-900">카테고리</span>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <ul className="py-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="block px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => setDrawerOpen(false)}
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
