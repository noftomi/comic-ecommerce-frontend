import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
})

export const fetchCart = () => api.get('/api/cart').then((r) => r.data)
export const addToCart = (comicId) => api.post('/api/cart', { comicId }).then((r) => r.data)
export const updateCartItem = (comicId, delta) => api.patch(`/api/cart/${comicId}`, { delta }).then((r) => r.data)
export const removeFromCart = (comicId) => api.delete(`/api/cart/${comicId}`).then((r) => r.data)
