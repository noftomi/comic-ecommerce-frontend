import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export const generateDescription = (fields) =>
  api.post('/api/generate-description', fields).then((r) => r.data)
