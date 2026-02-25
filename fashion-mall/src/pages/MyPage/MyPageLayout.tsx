import { Outlet } from 'react-router-dom'
import Container from '../../components/ui/Container'
import MyPageSidebar from './MyPageSidebar'

export default function MyPageLayout() {
  return (
    <Container>
      <div className="py-10">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">MY PAGE</h1>

        <div className="mt-8 flex gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-20">
              <MyPageSidebar />
            </div>
          </aside>

          {/* Content area */}
          <div className="min-w-0 flex-1">
            {/* Mobile nav (card list) */}
            <div className="mb-6 lg:hidden">
              <MyPageSidebar mobile />
            </div>

            <Outlet />
          </div>
        </div>
      </div>
    </Container>
  )
}
