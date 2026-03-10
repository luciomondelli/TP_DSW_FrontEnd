import api from '../services/api'
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return { userId: payload.userId, userType: payload.userType }
    } catch {
      localStorage.clear()
      return null
    }
  })

  const login = (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    const payload = JSON.parse(atob(accessToken.split('.')[1]))
    setUser({ userId: payload.userId, userType: payload.userType })
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken })
      }
    } catch {
    } finally {
      localStorage.clear()
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