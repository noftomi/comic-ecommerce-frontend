import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export const sendMessage = (messages) =>
  api.post('/api/chat', { messages }).then((r) => r.data)
