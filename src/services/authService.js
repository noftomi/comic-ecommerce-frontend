import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export const register = (data) => api.post('/api/auth/register', data).then(r => r.data)
export const login = (data) => api.post('/api/auth/login', data).then(r => r.data)
export const logout = () => api.post('/api/auth/logout').then(r => r.data)
export const getMe = () => api.get('/api/auth/me').then(r => r.data)
