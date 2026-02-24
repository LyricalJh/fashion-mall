import { Outlet, ScrollRestoration } from 'react-router-dom'
import Header from './Header'
import CatalogNav from './CatalogNav'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollRestoration />
      <Header />
      <CatalogNav />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  )
}
