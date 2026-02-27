import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import useSWR, { mutate as globalMutate } from 'swr'
import { apiGet, apiPost } from '../lib/apiClient'
import { useAuthStore } from '../store/authStore'
import type { LikeStatusResponse, LikedProductResponse } from '../types/api'

// ─── 글로벌 좋아요 상태 캐시 (컴포넌트 리마운트에도 유지) ───────────────────
interface LikeState {
  liked: boolean
  likeCount: number
}

const likeStateMap = new Map<number, LikeState>()
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((l) => l())
}

function getLikeState(productId: number): LikeState | undefined {
  return likeStateMap.get(productId)
}

function setLikeState(productId: number, state: LikeState) {
  likeStateMap.set(productId, state)
  notifyListeners()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

// snapshot을 Map 자체의 size + 내용 변경 시마다 바뀌도록
let snapshotVersion = 0
function getSnapshot() { return snapshotVersion }

function notifyAndBump() {
  snapshotVersion++
  notifyListeners()
}

// ─── localStorage 직접 확인 (Zustand hydration 지연 우회) ────────────────────
function checkLoggedIn(): boolean {
  try {
    const raw = localStorage.getItem('stylehub-auth')
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return parsed?.state?.isLoggedIn === true && !!parsed?.state?.accessToken
  } catch {
    return false
  }
}

// ─── useProductLike ──────────────────────────────────────────────────────────
export function useProductLike(productId: number, initialLikeCount?: number) {
  const storeLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const isLoggedIn = storeLoggedIn || checkLoggedIn()

  // 글로벌 캐시 구독 — 상태 변경 시 리렌더
  useSyncExternalStore(subscribe, getSnapshot)

  const cached = getLikeState(productId)

  // 마운트 시 API로 실제 상태 fetch (로그인 상태에서만)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) return
    let cancelled = false

    apiGet<LikeStatusResponse>(`/products/${productId}/like/status`)
      .then((res) => {
        if (cancelled) return
        setLikeState(productId, { liked: res.liked, likeCount: res.likeCount })
        notifyAndBump()
        setFetched(true)
      })
      .catch(() => {
        if (!cancelled) setFetched(true)
      })

    return () => { cancelled = true }
  }, [productId, isLoggedIn])

  const toggleLike = useCallback(async () => {
    if (!isLoggedIn) return

    const prev = cached ?? { liked: false, likeCount: initialLikeCount ?? 0 }
    const optimistic: LikeState = {
      liked: !prev.liked,
      likeCount: prev.likeCount + (prev.liked ? -1 : 1),
    }

    // 즉시 글로벌 캐시 업데이트
    setLikeState(productId, optimistic)
    notifyAndBump()

    try {
      const result = await apiPost<LikeStatusResponse>(
        `/products/${productId}/like`,
        {},
      )
      setLikeState(productId, { liked: result.liked, likeCount: result.likeCount })
      notifyAndBump()
      // curations & my likes 갱신
      globalMutate('/my/likes')
      globalMutate('/curations')
    } catch {
      // 롤백
      setLikeState(productId, prev)
      notifyAndBump()
    }
  }, [productId, isLoggedIn, cached, initialLikeCount])

  return {
    liked: cached?.liked ?? false,
    likeCount: cached?.likeCount ?? initialLikeCount ?? 0,
    isLoaded: cached !== undefined || fetched,
    toggleLike,
  }
}

// ─── useMyLikes ──────────────────────────────────────────────────────────────
export function useMyLikes() {
  const storeLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const isLoggedIn = storeLoggedIn || checkLoggedIn()

  const { data, isLoading, error } = useSWR<LikedProductResponse[]>(
    isLoggedIn ? '/my/likes' : null,
    () => apiGet<LikedProductResponse[]>('/my/likes'),
  )

  return { likes: data ?? [], isLoading, error }
}
