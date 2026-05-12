import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export const getAll = () => api.get('/api/comics').then((r) => r.data)
export const getById = (id) => api.get(`/api/comics/${id}`).then((r) => r.data)
