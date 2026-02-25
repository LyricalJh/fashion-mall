import { apiPost } from './apiClient'
import type { AuthResponse } from '../types/api'

export async function signup(
  email: string,
  password: string,
  name: string,
): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/signup', { email, password, name })
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/login', { email, password })
}
