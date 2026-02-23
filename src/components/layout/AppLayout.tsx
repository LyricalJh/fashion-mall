import { Outlet, ScrollRestoration } from 'react-router-dom'
import Header from './Header'
import CatalogNav from './CatalogNav'
import Footer from './Footer'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollRestoration />
      <Header />
      <CatalogNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
