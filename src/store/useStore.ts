import { create } from 'zustand'

interface StoreState {
  favorites: Set<string>
  cartCount: number
  toggleFavorite: (id: string) => void
  incrementCart: () => void
  decrementCart: () => void
}

export const useStore = create<StoreState>((set) => ({
  favorites: new Set(),
  cartCount: 3,
  toggleFavorite: (id) =>
    set((state) => {
      const next = new Set(state.favorites)
      next.has(id) ? next.delete(id) : next.add(id)
      return { favorites: next }
    }),
  incrementCart: () => set((state) => ({ cartCount: state.cartCount + 1 })),
  decrementCart: () =>
    set((state) => ({ cartCount: Math.max(0, state.cartCount - 1) })),
}))
