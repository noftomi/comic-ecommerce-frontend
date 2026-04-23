import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,
  isLoginOpen: false,

  addToCart: (product) =>
    set((state) => {
      const existing = state.items.find((item) => item.id === product.id)
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === product.id ? { ...item, qty: item.qty + 1 } : item
          )
        }
      }

      return { items: [...state.items, { ...product, qty: 1 }] }
    }),

  removeFromCart: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id)
    })),

  updateQty: (id, delta) =>
    set((state) => ({
      items: state.items
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    })),

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  openLogin: () => set({ isLoginOpen: true }),
  closeLogin: () => set({ isLoginOpen: false }),

  total: () => get().items.reduce((sum, item) => sum + item.price * item.qty, 0),
  totalItems: () => get().items.reduce((sum, item) => sum + item.qty, 0)
}))

export default useCartStore
