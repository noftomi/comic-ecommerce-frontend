import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
})

export const getAdminOrders = () => api.get('/api/admin/orders').then((r) => r.data)
export const getAdminOrderStats = () => api.get('/api/admin/orders/stats').then((r) => r.data)
export const updateAdminOrderStatus = (id, status) =>
  api.patch(`/api/admin/orders/${id}/status`, { status }).then((r) => r.data)
