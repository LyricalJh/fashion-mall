import { NavLink } from 'react-router-dom'

const navGroups = [
  {
    title: 'MY 쇼핑',
    items: [
      { label: '주문목록/배송조회', to: '/mypage/orders' },
      { label: '취소/반품/교환/환불 내역', to: '/mypage/returns' },
    ],
  },
  {
    title: 'MY 혜택',
    items: [{ label: '쿠폰/이용권', to: '/mypage/coupon' }],
  },
  {
    title: 'MY 활동',
    items: [{ label: '문의하기', to: '/mypage/inquiry' }],
  },
  {
    title: 'MY 정보',
    items: [
      { label: '배송지 변경', to: '/mypage/address' },
      { label: '회원탈퇴', to: '/mypage/withdraw' },
    ],
  },
]

interface Props {
  mobile?: boolean
}

export default function MyPageSidebar({ mobile = false }: Props) {
  if (mobile) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              {group.title}
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between border-b border-gray-50 px-4 py-3.5 text-sm transition-colors last:border-b-0 ${
                    isActive
                      ? 'bg-rose-50 font-medium text-rose-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
                aria-current={undefined}
              >
                {item.label}
                <svg
                  className="h-4 w-4 shrink-0 text-gray-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <nav aria-label="마이페이지 메뉴">
      {navGroups.map((group) => (
        <div key={group.title} className="mt-6 first:mt-0">
          <p className="text-sm font-semibold text-gray-500">{group.title}</p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-rose-50 font-medium text-rose-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
