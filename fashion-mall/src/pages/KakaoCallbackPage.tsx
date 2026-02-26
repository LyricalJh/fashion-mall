import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { ApiResponse, AuthResponse } from '../types/api'

const API_URL = import.meta.env.VITE_API_URL as string

export default function KakaoCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const loginStore = useAuthStore((s) => s.login)
  const [error, setError] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      setError('카카오 인가 코드가 없습니다.')
      return
    }

    async function processKakaoLogin(authCode: string) {
      try {
        const res = await fetch(
          `${API_URL}/auth/kakao/callback?code=${encodeURIComponent(authCode)}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } },
        )
        const json = (await res.json()) as ApiResponse<AuthResponse>

        if (!res.ok || !json.success || !json.data) {
          setError(json.error?.message ?? '카카오 로그인에 실패했습니다.')
          return
        }

        const data = json.data
        loginStore(
          { userId: data.userId, email: data.email, name: data.name, role: data.role },
          data.accessToken,
          data.refreshToken,
        )
        navigate('/', { replace: true })
      } catch {
        setError('카카오 로그인 처리 중 오류가 발생했습니다.')
      }
    }

    processKakaoLogin(code)
  }, [searchParams, loginStore, navigate])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <p className="mb-4 text-sm text-rose-600">{error}</p>
        <button
          onClick={() => navigate('/login', { replace: true })}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-500">카카오 로그인 처리 중...</p>
    </div>
  )
}
