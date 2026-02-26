import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
})

// Antes de cada request, agrega el token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si el token expira, reintenta con el refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 &&
        error.response?.data?.message === 'Token expired' &&
        !original._retry) {

      original._retry = true

      try {
        const refreshToken = sessionStorage.getItem('refreshToken')
        const { data } = await axios.post('http://localhost:3000/auth/refresh', { refreshToken })

        sessionStorage.setItem('accessToken', data.data.accessToken)
        sessionStorage.setItem('refreshToken', data.data.refreshToken)

        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api(original)

      } catch {
        sessionStorage.clear()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api