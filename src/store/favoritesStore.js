import { create } from 'zustand'
import { getFavorites, addFavorite, removeFavorite } from '../services/favoritesService'

const useFavoritesStore = create((set, get) => ({
  favorites: [],
  fetching: false,
  fetched: false,

  fetchFavorites: async () => {
    if (get().fetched || get().fetching) return
    set({ fetching: true })
    try {
      const data = await getFavorites()
      set({ favorites: data, fetched: true, fetching: false })
    } catch {
      set({ favorites: [], fetched: true, fetching: false })
    }
  },

  isFavorite: (id) => get().favorites.some((f) => f.id === id),

  addFavoriteItem: async (comicId) => {
    try {
      await addFavorite(comicId)
      const data = await getFavorites()
      set({ favorites: data })
    } catch (error) {
      console.error('addFavoriteItem error:', error)
    }
  },

  removeFavoriteItem: async (comicId) => {
    set((state) => ({ favorites: state.favorites.filter((f) => f.id !== comicId) }))
    try {
      await removeFavorite(comicId)
    } catch (error) {
      console.error('removeFavoriteItem error:', error)
      const data = await getFavorites()
      set({ favorites: data })
    }
  },

  clearFavorites: () => set({ favorites: [], fetched: false, fetching: false }),
}))

export default useFavoritesStore
