import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export const uploadComicImage = (file) => {
  const data = new FormData()
  data.append('image', file)

  return api
    .post('/api/uploads/comic-image', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)
}
