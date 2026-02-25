import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from '../types/cart'

interface StoreState {
  favorites: Set<string>
  cartItems: CartItem[]
  toggleFavorite: (id: string) => void
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  toggleSelect: (id: string) => void
  toggleSelectAll: (selected: boolean) => void
  deleteSelected: () => void
  clearCart: () => void
  // Stub: called after login to merge guest cart with server cart
  mergeCartWithServer: (serverItems: CartItem[]) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      favorites: new Set(),
      cartItems: [],

      toggleFavorite: (id) =>
        set((state) => {
          const next = new Set(state.favorites)
          next.has(id) ? next.delete(id) : next.add(id)
          return { favorites: next }
        }),

      addToCart: (item) =>
        set((state) => {
          const existing = state.cartItems.find((it) => it.id === item.id)
          if (existing) {
            return {
              cartItems: state.cartItems.map((it) =>
                it.id === item.id ? { ...it, quantity: it.quantity + item.quantity } : it
              ),
            }
          }
          return { cartItems: [...state.cartItems, item] }
        }),

      removeFromCart: (id) =>
        set((state) => ({
          cartItems: state.cartItems.filter((it) => it.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cartItems: state.cartItems.map((it) => (it.id === id ? { ...it, quantity } : it)),
        })),

      toggleSelect: (id) =>
        set((state) => ({
          cartItems: state.cartItems.map((it) =>
            it.id === id ? { ...it, selected: !it.selected } : it
          ),
        })),

      toggleSelectAll: (selected) =>
        set((state) => ({
          cartItems: state.cartItems.map((it) => ({ ...it, selected })),
        })),

      deleteSelected: () =>
        set((state) => ({
          cartItems: state.cartItems.filter((it) => !it.selected),
        })),

      clearCart: () => set({ cartItems: [] }),

      mergeCartWithServer: (_serverItems) => {
        // TODO: merge local cartItems with serverItems on login, then persist to server
      },
    }),
    {
      name: 'stylehub-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cartItems: state.cartItems,
        favorites: [...state.favorites],
      }),
      merge: (persisted, current) => {
        const p = persisted as { cartItems?: CartItem[]; favorites?: string[] }
        return {
          ...current,
          cartItems: p.cartItems ?? [],
          favorites: new Set(p.favorites ?? []),
        }
      },
    }
  )
)
