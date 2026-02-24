import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { categories } from '../../mock/categories'

export default function MobileBottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const cartCount = useStore((s) => s.cartItems.reduce((sum, it) => sum + it.quantity, 0))

  const pathname = location.pathname

  // Hide on cart/checkout/order-complete pages
  if (pathname === '/cart' || pathname === '/checkout' || pathname === '/order-complete') {
    return null
  }

  const isHome = pathname === '/'
  const isCategory = pathname.startsWith('/category')
  const isCart = pathname === '/cart'
  const isMyPage = pathname.startsWith('/mypage')

  const activeClass = 'text-rose-500'
  const inactiveClass = 'text-gray-400'

  function handleCategoryTab() {
    setSheetOpen((prev) => !prev)
  }

  function handleCategoryLink(slug: string) {
    setSheetOpen(false)
    navigate(`/category/${slug}`)
  }

  return (
    <>
      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t border-gray-200 bg-white md:hidden">
        {/* 홈 */}
        <Link
          to="/"
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${isHome ? activeClass : inactiveClass}`}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <polyline points="9 21 9 12 15 12 15 21" />
          </svg>
          홈
        </Link>

        {/* 카테고리 */}
        <button
          onClick={handleCategoryTab}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${isCategory || sheetOpen ? activeClass : inactiveClass}`}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          카테고리
        </button>

        {/* 찜 */}
        <button
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${inactiveClass}`}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          찜
        </button>

        {/* 장바구니 */}
        <Link
          to="/cart"
          className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${isCart ? activeClass : inactiveClass}`}
        >
          <span className="relative">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </span>
          장바구니
        </Link>

        {/* 마이 */}
        <Link
          to="/mypage"
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${isMyPage ? activeClass : inactiveClass}`}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          마이
        </Link>
      </nav>

      {/* Category slide-up sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSheetOpen(false)}
          />

          {/* Sheet */}
          <div className="relative rounded-t-2xl bg-white pb-20 shadow-xl">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>

            {/* Title */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
              <span className="text-base font-bold text-gray-900">카테고리</span>
              <button
                onClick={() => setSheetOpen(false)}
                className="text-gray-400"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Category grid */}
            <div className="grid grid-cols-3 gap-3 p-5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryLink(cat.slug)}
                  className="flex flex-col items-center justify-center rounded-xl border border-gray-100 py-4 text-sm font-medium text-gray-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 active:bg-rose-50"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
