import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export const getManagedComics = () => api.get('/api/management/comics').then((r) => r.data)
export const createManagedComic = (data) => api.post('/api/management/comics', data).then((r) => r.data)
export const updateManagedComic = (id, data) => api.patch(`/api/management/comics/${id}`, data).then((r) => r.data)
export const deleteManagedComic = (id) => api.delete(`/api/management/comics/${id}`).then((r) => r.data)
