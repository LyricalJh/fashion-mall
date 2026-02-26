import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { login as apiLogin, signup as apiSignup } from '../lib/auth'
import { mergeLocalCartToServer } from '../lib/cartMerge'

type Mode = 'social' | 'login' | 'signup'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginStore = useAuthStore((s) => s.login)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [mode, setMode] = useState<Mode>('social')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSocialLogin(provider: 'kakao' | 'naver') {
    if (provider === 'kakao') {
      const apiUrl = import.meta.env.VITE_API_URL as string
      window.location.href = `${apiUrl}/auth/kakao`
      return
    }
    // Naver login is not yet implemented - use stub
    const stubUser = {
      userId: 0,
      email: `${provider}@stub.local`,
      name: '네이버 사용자',
      role: 'USER',
    }
    loginStore(stubUser, 'stub-access-token', 'stub-refresh-token')
    navigate(from, { replace: true })
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiLogin(email, password)
      loginStore(
        {
          userId: res.userId, email: res.email, name: res.name, role: res.role,
          phone: res.phone, postcode: res.postcode, address: res.address, addressDetail: res.addressDetail,
        },
        res.accessToken,
        res.refreshToken,
      )
      await mergeLocalCartToServer()
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiSignup(email, password, name)
      loginStore(
        {
          userId: res.userId, email: res.email, name: res.name, role: res.role,
          phone: res.phone, postcode: res.postcode, address: res.address, addressDetail: res.addressDetail,
        },
        res.accessToken,
        res.refreshToken,
      )
      await mergeLocalCartToServer()
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
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
          소셜 계정 또는 이메일로 시작하세요
        </p>

        {/* Social buttons */}
        <button
          onClick={() => handleSocialLogin('kakao')}
          className="flex w-full items-center justify-center gap-3 rounded-xl py-3.5 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90 active:scale-[.98]"
          style={{ backgroundColor: '#FEE500' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.67 5.32 4.19 6.87l-.97 3.58a.4.4 0 0 0 .58.46l4.14-2.74A11.6 11.6 0 0 0 12 19c5.52 0 10-3.58 10-8S17.52 3 12 3Z" />
          </svg>
          카카오 계정으로 로그인
        </button>

        <button
          onClick={() => handleSocialLogin('naver')}
          className="mt-3 flex w-full items-center justify-center gap-3 rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[.98]"
          style={{ backgroundColor: '#03C75A' }}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-white text-xs font-black leading-none" style={{ color: '#03C75A' }}>
            N
          </span>
          네이버 계정으로 로그인
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">또는</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Email mode toggle */}
        {mode === 'social' && (
          <button
            onClick={() => setMode('login')}
            className="w-full rounded-xl border border-gray-300 py-3.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
          >
            이메일로 로그인
          </button>
        )}

        {/* Email login form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            {error && <p className="text-xs text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gray-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-gray-700 disabled:opacity-60"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <button type="button" onClick={() => setMode('social')} className="hover:text-gray-700">
                소셜 로그인으로
              </button>
              <button type="button" onClick={() => { setMode('signup'); setError('') }} className="hover:text-gray-700">
                회원가입
              </button>
            </div>
          </form>
        )}

        {/* Signup form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            <input
              type="password"
              placeholder="비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            {error && <p className="text-xs text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gray-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-gray-700 disabled:opacity-60"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError('') }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              이미 계정이 있으신가요? 로그인
            </button>
          </form>
        )}
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
