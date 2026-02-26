import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/SportLink_logo-sin-fondo.png'

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: '#2D3A8C' }}>

      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md px-10 py-12 flex flex-col items-center gap-6">
        <img src={logo} alt="SportLink" className="w-28" />

        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">Bienvenido a SportLink</p>
          <h1 className="text-2xl font-bold" style={{ color: '#2D3A8C' }}>
            {user?.userType}
          </h1>
          <p className="text-gray-500 text-sm mt-1">ID: {user?.userId}</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm transition"
          style={{ backgroundColor: '#2D3A8C' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7DD4E8'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2D3A8C'}
        >
          Cerrar sesión
        </button>
      </div>

    </div>
  )
}