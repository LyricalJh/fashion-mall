import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface AuthUser {
  userId: number
  email: string
  name: string
  role: string
  phone?: string
  postcode?: string
  address?: string
  addressDetail?: string
}

interface AuthState {
  isLoggedIn: boolean
  user: AuthUser | null
  accessToken: string | null
  login: (user: AuthUser, accessToken: string, refreshToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      accessToken: null,

      login: (user, accessToken, refreshToken) => {
        // refreshToken은 향후 토큰 갱신 로직에서 사용할 수 있도록 localStorage에 별도 보관
        localStorage.setItem('stylehub-refresh-token', refreshToken)
        set({ isLoggedIn: true, user, accessToken })
      },

      logout: () => {
        localStorage.removeItem('stylehub-refresh-token')
        set({ isLoggedIn: false, user: null, accessToken: null })
      },
    }),
    {
      name: 'stylehub-auth',
      storage: createJSONStorage(() => localStorage),
      // accessToken을 포함하여 persist
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        accessToken: state.accessToken,
      }),
    },
  ),
)
