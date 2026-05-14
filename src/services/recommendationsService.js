import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export const getRecommendations = (mode = 'normal', categories = [], publishers = []) => {
  const params = new URLSearchParams()
  if (mode === 'explore') params.set('mode', 'explore')
  if (categories.length) params.set('categories', categories.join(','))
  if (publishers.length) params.set('publishers', publishers.join(','))
  const qs = params.toString()
  return api.get(`/api/recommendations${qs ? `?${qs}` : ''}`).then((r) => r.data)
}

export const getRelated = (comicId) =>
  api.get(`/api/comics/${comicId}/related`).then((r) => r.data)
