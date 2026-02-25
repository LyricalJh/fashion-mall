import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import HomePage from '../pages/HomePage'
import CategoryPage from '../pages/CategoryPage'
import ProductDetailPage from '../pages/ProductDetailPage'
import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import OrderCompletePage from '../pages/OrderCompletePage'
import LoginPage from '../pages/LoginPage'
import MyPageLayout from '../pages/MyPage/MyPageLayout'
import OrderListPage from '../pages/MyPage/OrderListPage'
import OrderDetailPage from '../pages/MyPage/OrderDetailPage'
import CancelReturnPage from '../pages/MyPage/CancelReturnPage'
import ClaimDetailPage from '../pages/MyPage/ClaimDetailPage'
import CouponPage from '../pages/MyPage/CouponPage'
import InquiryPage from '../pages/MyPage/InquiryPage'
import AddressPage from '../pages/MyPage/AddressPage'
import AddressFormPage from '../pages/MyPage/AddressFormPage'
import WithdrawPage from '../pages/MyPage/WithdrawPage'
import { useAuthStore } from '../store/authStore'

/** 로그인이 필요한 라우트를 보호합니다. 미로그인 시 /login으로 리다이렉트 */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const location = useLocation()
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'category/:categoryId', element: <CategoryPage /> },
      { path: 'product/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'order-complete', element: <OrderCompletePage /> },
      {
        path: 'mypage',
        element: <RequireAuth><MyPageLayout /></RequireAuth>,
        children: [
          { index: true, element: <Navigate to="orders" replace /> },
          { path: 'orders', element: <OrderListPage /> },
          { path: 'orders/:orderId', element: <OrderDetailPage /> },
          { path: 'returns', element: <CancelReturnPage /> },
          { path: 'returns/:claimId', element: <ClaimDetailPage /> },
          { path: 'coupon', element: <CouponPage /> },
          { path: 'inquiry', element: <InquiryPage /> },
          { path: 'address', element: <AddressPage /> },
          { path: 'address/new', element: <AddressFormPage /> },
          { path: 'address/:addressId/edit', element: <AddressFormPage /> },
          { path: 'withdraw', element: <WithdrawPage /> },
        ],
      },
    ],
  },
])
