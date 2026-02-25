import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api'
import logo from '../assets/SportLink_logo-sin-fondo.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data.data.accessToken, data.data.refreshToken)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#2D3A8C' }}>

      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md px-10 py-12">

        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="SportLink" className="w-30 mb-4" />
          <h1 className="text-2xl font-bold mt-1" style={{ color: '#2D3A8C' }}>
            SportLink
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            La red deportiva profesional
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm transition disabled:opacity-50"
            style={{ backgroundColor: '#2D3A8C' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7DD4E8'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2D3A8C'}
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          ¿No tenés cuenta?{' '}
          <a
            href="/register"
            className="font-semibold transition"
            style={{ color: '#2D3A8C' }}
            onMouseEnter={e => e.currentTarget.style.color = '#7DD4E8'}
            onMouseLeave={e => e.currentTarget.style.color = '#2D3A8C'}
          >
            Registrate
          </a>
        </p>
      </div>
    </div>
  )
}