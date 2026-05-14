import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export const getRecommendations = (mode = 'normal') =>
  api.get(`/api/recommendations${mode === 'explore' ? '?mode=explore' : ''}`).then((r) => r.data)

export const getRelated = (comicId) =>
  api.get(`/api/comics/${comicId}/related`).then((r) => r.data)
