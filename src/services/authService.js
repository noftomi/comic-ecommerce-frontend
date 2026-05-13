import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
})

export const register = (data) => api.post('/api/auth/register', data).then(r => r.data)
export const login = (data) => api.post('/api/auth/login', data).then(r => r.data)
export const logout = () => api.post('/api/auth/logout').then(r => r.data)
export const getMe = () => api.get('/api/auth/me').then(r => r.data)
export const updateProfile = (data) => api.patch('/api/users/me', data).then(r => r.data)
export const verifyEmail = (token) => api.get(`/api/auth/verify-email?token=${token}`).then(r => r.data)
export const resendVerification = (email) => api.post('/api/auth/resend-verification', { email }).then(r => r.data)
export const forgotPassword = (email) => api.post('/api/auth/forgot-password', { email }).then(r => r.data)
export const resetPassword = (token, password) => api.post('/api/auth/reset-password', { token, password }).then(r => r.data)
