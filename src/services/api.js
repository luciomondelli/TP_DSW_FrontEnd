import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 &&
        error.response?.data?.message === 'Token expired' &&
        !original._retry) {

      original._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await api.post('/auth/refresh', { refreshToken })

        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken)

        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api(original)

      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api