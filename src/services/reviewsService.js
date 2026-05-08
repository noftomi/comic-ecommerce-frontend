import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export const getReviews = (comicId) => api.get(`/api/comics/${comicId}/reviews`).then(r => r.data)
export const createReview = (comicId, data) => api.post(`/api/comics/${comicId}/reviews`, data).then(r => r.data)
export const deleteReview = (reviewId) => api.delete(`/api/reviews/${reviewId}`).then(r => r.data)