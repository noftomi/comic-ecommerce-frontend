import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
})

export const createOrder = () => api.post('/api/orders').then((r) => r.data)
export const getOrders = () => api.get('/api/orders').then((r) => r.data)
