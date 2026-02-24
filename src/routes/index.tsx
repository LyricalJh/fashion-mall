import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import HomePage from '../pages/HomePage'
import CategoryPage from '../pages/CategoryPage'
import ProductDetailPage from '../pages/ProductDetailPage'
import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import OrderCompletePage from '../pages/OrderCompletePage'
import MyPageLayout from '../pages/MyPage/MyPageLayout'
import OrderListPage from '../pages/MyPage/OrderListPage'
import CancelReturnPage from '../pages/MyPage/CancelReturnPage'
import CouponPage from '../pages/MyPage/CouponPage'
import InquiryPage from '../pages/MyPage/InquiryPage'
import AddressPage from '../pages/MyPage/AddressPage'
import WithdrawPage from '../pages/MyPage/WithdrawPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'category/:slug', element: <CategoryPage /> },
      { path: 'product/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'order-complete', element: <OrderCompletePage /> },
      {
        path: 'mypage',
        element: <MyPageLayout />,
        children: [
          { index: true, element: <Navigate to="orders" replace /> },
          { path: 'orders', element: <OrderListPage /> },
          { path: 'returns', element: <CancelReturnPage /> },
          { path: 'coupon', element: <CouponPage /> },
          { path: 'inquiry', element: <InquiryPage /> },
          { path: 'address', element: <AddressPage /> },
          { path: 'withdraw', element: <WithdrawPage /> },
        ],
      },
    ],
  },
])
