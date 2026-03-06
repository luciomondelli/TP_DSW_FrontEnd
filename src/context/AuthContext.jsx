import api from '../services/api'
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = sessionStorage.getItem('accessToken')
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return { userId: payload.userId, userType: payload.userType }
    } catch {
      sessionStorage.clear()
      return null
    }
  })

  const login = (accessToken, refreshToken) => {
    sessionStorage.setItem('accessToken', accessToken)
    sessionStorage.setItem('refreshToken', refreshToken)
    const payload = JSON.parse(atob(accessToken.split('.')[1]))
    setUser({ userId: payload.userId, userType: payload.userType })
  }

  const logout = async () => {
    try {
      const refreshToken = sessionStorage.getItem('refreshToken')
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken })
      }
    } catch {
      // Si la llamada falla igual limpiamos la sesión del cliente.
      // El token expirará solo en 7 días en el peor caso.
    } finally {
      sessionStorage.clear()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}