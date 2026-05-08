import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export const getFavorites = () => api.get('/api/favorites').then(r => r.data)
export const addFavorite = (comicId) => api.post(`/api/favorites/${comicId}`).then(r => r.data)
export const removeFavorite = (comicId) => api.delete(`/api/favorites/${comicId}`).then(r => r.data)