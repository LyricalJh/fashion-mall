import type { ApiResponse } from '../types/api'

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

async function parseResponse<T>(res: Response): Promise<T> {
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
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: buildHeaders(),
  })
  return parseResponse<T>(res)
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  })
  return parseResponse<T>(res)
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  })
  return parseResponse<T>(res)
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })

  if (res.status === 401) {
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
