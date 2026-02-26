import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import logo from '../assets/SportLink_logo-sin-fondo.png'
import { getSports, getPositionsBySport } from '../services/catalogService.js'
import { useState, useEffect } from 'react'

export default function Register() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [hoveredSport, setHoveredSport] = useState(null)
  const [hoveredPosition, setHoveredPosition] = useState(null)
  const [hoveredUserType, setHoveredUserType] = useState(null)
  const [sports, setSports] = useState([])
const [positions, setPositions] = useState([])

useEffect(() => {
  getSports().then(setSports).catch(() => setSports([]))
}, [])


  const [userData, setUserData] = useState({
    email: '',
    password: '',
    phoneNumber: '',
    userType: '',
  })

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    nationality: '',
    isSigned: false,
    sportIds: [],
    positionIds: [],
    name: '',
    address: '',
    openingDate: '',
  })

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value })
  }

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target
    setProfileData({ ...profileData, [name]: type === 'checkbox' ? checked : value })
  }

const toggleSport = async (id) => {
  const current = profileData.sportIds
  if (current.includes(id)) {
    setProfileData({ ...profileData, sportIds: current.filter(s => s !== id), positionIds: [] })
    setPositions([])
  } else {
    const newSportIds = [...current, id]
    setProfileData({ ...profileData, sportIds: newSportIds })
    try {
      const pos = await getPositionsBySport(id)
      setPositions(prev => {
        const existingIds = prev.map(p => p.id)
        const newOnes = pos.filter(p => !existingIds.includes(p.id))
        return [...prev, ...newOnes]
      })
    } catch {
      // si falla no pasa nada
    }
  }
}

const togglePosition = (id) => {
  const current = profileData.positionIds
  if (current.includes(id)) {
    setProfileData({ ...profileData, positionIds: current.filter(p => p !== id) })
  } else {
    setProfileData({ ...profileData, positionIds: [...current, id] })
  }
}

const availablePositions = positions.filter(p => profileData.sportIds.includes(p.sport.id))

  const handleNext = (e) => {
    e.preventDefault()
    if (!userData.userType) {
      setError('Seleccioná un tipo de perfil')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let body = {
        email: userData.email,
        password: userData.password,
        userType: userData.userType,
      }

      if (userData.phoneNumber) body.phoneNumber = userData.phoneNumber

      if (userData.userType === 'ATHLETE') {
        body.athleteProfile = {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          birthDate: profileData.birthDate,
          nationality: profileData.nationality,
          isSigned: profileData.isSigned,
          sportIds: profileData.sportIds,
          positionIds: profileData.positionIds,
        }
      } else if (userData.userType === 'CLUB') {
        body.clubProfile = {
          name: profileData.name,
          address: profileData.address,
          openingDate: profileData.openingDate,
        }
      } else if (userData.userType === 'AGENT') {
        body.agentProfile = {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
        }
      }

      await api.post('/users', body)
      navigate('/login')

    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: '#2D3A8C' }}>

      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md px-10 py-12">

        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="SportLink" className="w-28 mb-1" />
          <p className="text-gray-400 text-sm">
            {step === 1 ? 'Creá tu cuenta' : 'Completá tu perfil'}
          </p>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: '#2D3A8C' }}></div>
          <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: step === 2 ? '#2D3A8C' : '#e5e7eb' }}></div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleNext} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleUserChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                value={userData.password}
                onChange={handleUserChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-gray-400">(opcional)</span></label>
              <input
                type="tel"
                name="phoneNumber"
                value={userData.phoneNumber}
                onChange={handleUserChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="+54 9 11 1234 5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de perfil</label>
              <div className="flex gap-3">
                {['ATHLETE', 'CLUB', 'AGENT'].map(type => (
                  <button
                        key={type}
                        type="button"
                        onClick={() => setUserData({ ...userData, userType: type })}
                        onMouseEnter={() => setHoveredUserType(type)}
                        onMouseLeave={() => setHoveredUserType(null)}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition"
                        style={{
                            borderColor: userData.userType === type ? '#2D3A8C' : hoveredUserType === type ? '#7DD4E8' : '#e5e7eb',
                            backgroundColor: userData.userType === type ? '#2D3A8C' : hoveredUserType === type ? '#7DD4E8' : 'white',
                            color: userData.userType === type || hoveredUserType === type ? 'white' : '#6b7280',
                  }}
                >
                  {type === 'ATHLETE' ? 'Atleta' : type === 'CLUB' ? 'Club' : 'Agente'}
                </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition"
              style={{ backgroundColor: '#2D3A8C' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7DD4E8'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2D3A8C'}
            >
              Siguiente
            </button>

            <p className="text-center text-sm text-gray-500">
              ¿Ya tenés cuenta?{' '}
              <a
                href="/login"
                className="font-semibold transition"
                style={{ color: '#2D3A8C' }}
                onMouseEnter={e => e.currentTarget.style.color = '#7DD4E8'}
                onMouseLeave={e => e.currentTarget.style.color = '#2D3A8C'}
                >
              </a>
                Iniciá sesión
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {(userData.userType === 'ATHLETE' || userData.userType === 'AGENT') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Tu apellido"
                    required
                  />
                </div>
              </>
            )}

            {userData.userType === 'ATHLETE' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={profileData.birthDate}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
                  <input
                    type="text"
                    name="nationality"
                    value={profileData.nationality}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Ej: Argentina"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deportes</label>
                  <div className="flex flex-wrap gap-2">
                    {sports.map(sport => (
                      <button
                            key={sport.id}
                            type="button"
                            onClick={() => toggleSport(sport.id)}
                            onMouseEnter={() => setHoveredSport(sport.id)}
                            onMouseLeave={() => setHoveredSport(null)}
                            className="px-4 py-2 rounded-xl text-sm font-medium border-2 transition"
                            style={{
                            borderColor: profileData.sportIds.includes(sport.id) ? '#2D3A8C' : hoveredSport === sport.id ? '#7DD4E8' : '#e5e7eb',
                            backgroundColor: profileData.sportIds.includes(sport.id) ? '#2D3A8C' : hoveredSport === sport.id ? '#7DD4E8' : 'white',
                            color: profileData.sportIds.includes(sport.id) || hoveredSport === sport.id ? 'white' : '#6b7280',
                    }}
                  >
                    {sport.name}
                  </button>
                    ))}
                  </div>
                </div>

                {availablePositions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Posiciones</label>
                    <div className="flex flex-wrap gap-2">
                      {availablePositions.map(pos => (
                        <button
                            key={pos.id}
                            type="button"
                            onClick={() => togglePosition(pos.id)}
                            onMouseEnter={() => setHoveredPosition(pos.id)}
                            onMouseLeave={() => setHoveredPosition(null)}
                            className="px-4 py-2 rounded-xl text-sm font-medium border-2 transition"
                            style={{
                            borderColor: profileData.positionIds.includes(pos.id) ? '#2D3A8C' : hoveredPosition === pos.id ? '#7DD4E8' : '#e5e7eb',
                            backgroundColor: profileData.positionIds.includes(pos.id) ? '#2D3A8C' : hoveredPosition === pos.id ? '#7DD4E8' : 'white',
                            color: profileData.positionIds.includes(pos.id) || hoveredPosition === pos.id ? 'white' : '#6b7280',
                    }}
                  >
                    {pos.name}
                  </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isSigned"
                    id="isSigned"
                    checked={profileData.isSigned}
                    onChange={handleProfileChange}
                    className="w-4 h-4 accent-blue-700"
                  />
                  <label htmlFor="isSigned" className="text-sm text-gray-700">
                    Actualmente estoy fichado
                  </label>
                </div>
              </>
            )}

            {userData.userType === 'CLUB' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del club</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Nombre del club"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Dirección del club"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fundación</label>
                  <input
                    type="date"
                    name="openingDate"
                    value={profileData.openingDate}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition"
                style={{ borderColor: '#2D3A8C', color: '#2D3A8C' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2D3A8C'; e.currentTarget.style.color = 'white' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#2D3A8C' }}
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-semibold text-white text-sm transition disabled:opacity-50"
                style={{ backgroundColor: '#2D3A8C' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7DD4E8'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2D3A8C'}
              >
                {loading ? 'Registrando...' : 'Registrarme'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  )
}