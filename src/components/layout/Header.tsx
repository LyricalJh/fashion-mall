import { Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import Container from '../ui/Container'
import IconButton from '../ui/IconButton'

export default function Header() {
  const cartCount = useStore((s) => s.cartItems.reduce((sum, it) => sum + it.quantity, 0))

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <Container>
        <div className="flex h-12 items-center gap-4 md:h-16">
          {/* Brand logo */}
          <Link to="/" className="shrink-0 text-xl font-black tracking-tight text-gray-900">
            STYLE<span className="text-rose-500">HUB</span>
          </Link>

          {/* Search */}
          <div className="mx-4 hidden flex-1 items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 md:flex">
            <svg className="mr-2 h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="브랜드, 상품 검색"
              className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
            />
          </div>

          {/* Icons */}
          <div className="hidden items-center gap-1 md:flex">
            <Link to="/mypage">
              <IconButton label="마이페이지">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </IconButton>
            </Link>

            <IconButton label="Favorites">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </IconButton>

            <Link to="/cart" className="relative">
              <IconButton label="Cart">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </IconButton>
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </Container>
    </header>
  )
}
