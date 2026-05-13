import { create } from 'zustand'
import * as cartService from '../services/cartService'

const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,
  isLoginOpen: false,

  fetchCart: async () => {
    try {
      const items = await cartService.fetchCart()
      set({ items })
    } catch {
      // no logueado, mantiene estado local
    }
  },

  clearCart: () => set({ items: [] }),

  addToCart: async (product) => {
    set((state) => {
      const existing = state.items.find((item) => item.id === product.id)
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === product.id ? { ...item, qty: item.qty + 1 } : item
          ),
        }
      }
      return { items: [...state.items, { ...product, qty: 1 }] }
    })
    try {
      await cartService.addToCart(product.id)
    } catch {}
  },

  removeFromCart: async (id) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
    try {
      await cartService.removeFromCart(id)
    } catch {}
  },

  updateQty: async (id, delta) => {
    set((state) => ({
      items: state.items
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0),
    }))
    try {
      await cartService.updateCartItem(id, delta)
    } catch {}
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  openLogin: () => set({ isLoginOpen: true }),
  closeLogin: () => set({ isLoginOpen: false }),

  isFavoritesOpen: false,
  openFavorites: () => set({ isFavoritesOpen: true }),
  closeFavorites: () => set({ isFavoritesOpen: false }),
  total: () => get().items.reduce((sum, item) => sum + item.price * item.qty, 0),
  totalItems: () => get().items.reduce((sum, item) => sum + item.qty, 0),
}))

export default useCartStore
