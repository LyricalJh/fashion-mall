import type { ApiResponse, AuthResponse } from '../types/api'

const BASE_URL = import.meta.env.VITE_API_URL as string

function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem('stylehub-auth')
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string } }
    return parsed?.state?.accessToken ?? null
  } catch {
    return null
  }
}

function buildHeaders(): Headers {
  const headers = new Headers({
    'Content-Type': 'application/json',
  })
  const token = getAccessToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return headers
}

function handleUnauthorized(): void {
  localStorage.removeItem('stylehub-auth')
  window.location.href = '/login'
}

let isRefreshing = false

async function tryRefreshToken(): Promise<boolean> {
  if (isRefreshing) return false
  isRefreshing = true

  try {
    const refreshToken = localStorage.getItem('stylehub-refresh-token')
    if (!refreshToken) return false

    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) return false

    const json = (await res.json()) as ApiResponse<AuthResponse>
    if (!json.success || !json.data) return false

    // Update zustand persisted store in localStorage
    const raw = localStorage.getItem('stylehub-auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      parsed.state.accessToken = json.data.accessToken
      parsed.state.user = {
        ...parsed.state.user,
        phone: json.data.phone,
        postcode: json.data.postcode,
        address: json.data.address,
        addressDetail: json.data.addressDetail,
      }
      localStorage.setItem('stylehub-auth', JSON.stringify(parsed))
    }
    localStorage.setItem('stylehub-refresh-token', json.data.refreshToken)
    return true
  } catch {
    return false
  } finally {
    isRefreshing = false
  }
}

async function parseResponse<T>(res: Response, retryFn?: () => Promise<Response>): Promise<T> {
  if (res.status === 401 && retryFn) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      const retryRes = await retryFn()
      return parseResponse<T>(retryRes)
    }
    handleUnauthorized()
    throw new Error('Unauthorized')
  }

  if (res.status === 401) {
    handleUnauthorized()
    throw new Error('Unauthorized')
  }

  const json = (await res.json()) as ApiResponse<T>

  if (!res.ok || !json.success) {
    const message = json.error?.message ?? `HTTP ${res.status}`
    throw new Error(message)
  }

  return json.data as T
}

export async function apiGet<T>(path: string): Promise<T> {
  const doFetch = () => fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: buildHeaders(),
  })
  const res = await doFetch()
  return parseResponse<T>(res, doFetch)
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const doFetch = () => fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  })
  const res = await doFetch()
  return parseResponse<T>(res, doFetch)
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const doFetch = () => fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  })
  const res = await doFetch()
  return parseResponse<T>(res, doFetch)
}

export async function apiDelete(path: string): Promise<void> {
  const doFetch = () => fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })
  const res = await doFetch()

  if (res.status === 401) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      const retryRes = await doFetch()
      if (retryRes.status === 401) {
        handleUnauthorized()
        throw new Error('Unauthorized')
      }
      if (!retryRes.ok) {
        let message = `HTTP ${retryRes.status}`
        try {
          const json = (await retryRes.json()) as ApiResponse<unknown>
          if (json.error?.message) message = json.error.message
        } catch { /* ignore */ }
        throw new Error(message)
      }
      return
    }
    handleUnauthorized()
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const json = (await res.json()) as ApiResponse<unknown>
      if (json.error?.message) {
        message = json.error.message
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }
}
