import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  function handleLogin(provider: 'kakao' | 'naver') {
    // Stub: 실제 OAuth 없이 즉시 로그인 처리
    login({ name: provider === 'kakao' ? '카카오 사용자' : '네이버 사용자', provider })
    navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      {/* Logo */}
      <Link to="/" className="mb-10 text-3xl font-black tracking-tight text-gray-900">
        STYLE<span className="text-rose-500">HUB</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl bg-white px-8 py-10 shadow-sm">
        <h1 className="mb-1 text-center text-xl font-bold text-gray-900">로그인</h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          소셜 계정으로 간편하게 시작하세요
        </p>

        {/* Kakao */}
        <button
          onClick={() => handleLogin('kakao')}
          className="flex w-full items-center justify-center gap-3 rounded-xl py-3.5 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90 active:scale-[.98]"
          style={{ backgroundColor: '#FEE500' }}
        >
          {/* Kakao icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.67 5.32 4.19 6.87l-.97 3.58a.4.4 0 0 0 .58.46l4.14-2.74A11.6 11.6 0 0 0 12 19c5.52 0 10-3.58 10-8S17.52 3 12 3Z" />
          </svg>
          카카오 계정으로 로그인
        </button>

        {/* Naver */}
        <button
          onClick={() => handleLogin('naver')}
          className="mt-3 flex w-full items-center justify-center gap-3 rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[.98]"
          style={{ backgroundColor: '#03C75A' }}
        >
          {/* Naver N icon */}
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-white text-xs font-black leading-none" style={{ color: '#03C75A' }}>
            N
          </span>
          네이버 계정으로 로그인
        </button>
      </div>

      {/* Back to home */}
      <Link
        to="/"
        className="mt-6 flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-gray-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        홈으로 돌아가기
      </Link>
    </div>
  )
}
