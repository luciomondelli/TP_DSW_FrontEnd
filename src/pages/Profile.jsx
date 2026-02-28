import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'
import { getSports, getPositionsBySport } from '../services/catalogService.js'

export default function Profile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sports, setSports] = useState([])
  const [positions, setPositions] = useState([])

  const [userForm, setUserForm] = useState({ phoneNumber: '' })
  const [profileForm, setProfileForm] = useState({})

  const isOwner = parseInt(id) === user.userId

  useEffect(() => {
    loadProfile()
    getSports().then(setSports).catch(() => {})
  }, [id])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/users/${id}`)
      const p = data.data
      setProfile(p)
      setUserForm({ phoneNumber: p.phoneNumber || '' })

      if (p.userType === 'ATHLETE') {
        const ap = p.athleteProfile
        setProfileForm({
          firstName: ap.firstName,
          lastName: ap.lastName,
          birthDate: ap.birthDate?.split('T')[0] || '',
          nationality: ap.nationality,
          isSigned: ap.isSigned,
          sportIds: ap.sports?.map(s => s.id) || [],
          positionIds: ap.positions?.map(pos => pos.id) || [],
        })
        const allPositions = []
        for (const sport of ap.sports || []) {
          const pos = await getPositionsBySport(sport.id)
          allPositions.push(...pos)
        }
        setPositions(allPositions)
      } else if (p.userType === 'CLUB') {
        const cp = p.clubProfile
        setProfileForm({
          name: cp.name,
          address: cp.address,
          openingDate: cp.openingDate?.split('T')[0] || '',
        })
      } else if (p.userType === 'AGENT') {
        const ag = p.agentProfile
        setProfileForm({
          firstName: ag.firstName,
          lastName: ag.lastName,
        })
      }
    } catch {
      setError('No se pudo cargar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const toggleSport = async (sportId) => {
    const current = profileForm.sportIds || []
    if (current.includes(sportId)) {
      const newSportIds = current.filter(s => s !== sportId)
      setProfileForm({ ...profileForm, sportIds: newSportIds, positionIds: [] })
      setPositions(positions.filter(p => p.sport.id !== sportId))
    } else {
      const newSportIds = [...current, sportId]
      setProfileForm({ ...profileForm, sportIds: newSportIds })
      const pos = await getPositionsBySport(sportId)
      setPositions(prev => {
        const existingIds = prev.map(p => p.id)
        return [...prev, ...pos.filter(p => !existingIds.includes(p.id))]
      })
    }
  }

  const togglePosition = (posId) => {
    const current = profileForm.positionIds || []
    if (current.includes(posId)) {
      setProfileForm({ ...profileForm, positionIds: current.filter(p => p !== posId) })
    } else {
      setProfileForm({ ...profileForm, positionIds: [...current, posId] })
    }
  }

  const availablePositions = positions.filter(p =>
    (profileForm.sportIds || []).includes(p.sport.id)
  )

  const handleSave = async () => {
  setSaving(true)
  setError('')
  setSuccess('')
  try {
    if (userForm.phoneNumber && userForm.phoneNumber !== profile.phoneNumber) {
      await api.patch(`/users/${id}`, { phoneNumber: userForm.phoneNumber })
    }

    const cleanBody = (obj) => Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    )

    if (profile.userType === 'ATHLETE') {
      await api.patch(`/athletes/${profile.athleteProfile.id}`, cleanBody(profileForm))
    } else if (profile.userType === 'CLUB') {
      await api.patch(`/clubs/${profile.clubProfile.id}`, cleanBody(profileForm))
    } else if (profile.userType === 'AGENT') {
      await api.patch(`/agents/${profile.agentProfile.id}`, cleanBody(profileForm))
    }

    setSuccess('Perfil actualizado correctamente')
    setEditing(false)
    loadProfile()
  } catch (err) {
    setError(err.response?.data?.message || 'Error al guardar los cambios')
  } finally {
    setSaving(false)
  }
}

  const getDisplayName = () => {
    if (!profile) return ''
    if (profile.userType === 'ATHLETE') return `${profile.athleteProfile?.firstName} ${profile.athleteProfile?.lastName}`
    if (profile.userType === 'CLUB') return profile.clubProfile?.name
    if (profile.userType === 'AGENT') return `${profile.agentProfile?.firstName} ${profile.agentProfile?.lastName}`
    return profile.email
  }

  const getInitials = () => {
    if (!profile) return '?'
    if (profile.userType === 'ATHLETE') return `${profile.athleteProfile?.firstName?.[0]}${profile.athleteProfile?.lastName?.[0]}`
    if (profile.userType === 'CLUB') return profile.clubProfile?.name?.[0]
    if (profile.userType === 'AGENT') return `${profile.agentProfile?.firstName?.[0]}${profile.agentProfile?.lastName?.[0]}`
    return '?'
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0f4ff' }}>
      <p className="text-gray-400">Cargando perfil...</p>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f4ff' }}>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between pl-2 pr-6 shadow-md"
        style={{ backgroundColor: '#2D3A8C' }}>
        <div className="overflow-hidden h-12 flex items-center">
          <img src="/SportLink-Logo-BordeBlanco.png" alt="SportLink" className="h-20 -my-6" />
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-white text-sm font-medium transition"
          onMouseEnter={e => e.currentTarget.style.color = '#7DD4E8'}
          onMouseLeave={e => e.currentTarget.style.color = 'white'}
        >
          ← Volver al inicio
        </button>
      </nav>

      <div className="max-w-2xl mx-auto pt-24 px-6 pb-10">

        {/* HEADER DEL PERFIL */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
            style={{ backgroundColor: '#2D3A8C' }}>
            {getInitials()}
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#2D3A8C' }}>{getDisplayName()}</h1>
            <p className="text-sm text-gray-400">{profile?.userType}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-4 text-sm">
            {success}
          </div>
        )}

        {/* DATOS DEL USUARIO */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4">Datos de contacto</h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={userForm.phoneNumber}
                onChange={e => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                disabled={!editing || !isOwner}
                className={`w-full border rounded-xl px-4 py-3 text-sm transition ${editing && isOwner ? 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                placeholder="Sin teléfono registrado"
              />
            </div>
          </div>
        </div>

        {/* DATOS DEL PERFIL */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4">
            {profile?.userType === 'ATHLETE' ? 'Datos del atleta' : profile?.userType === 'CLUB' ? 'Datos del club' : 'Datos del agente'}
          </h2>

          <div className="flex flex-col gap-4">

            {(profile?.userType === 'ATHLETE' || profile?.userType === 'AGENT') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={profileForm.firstName || ''}
                    onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    disabled={!editing || !isOwner}
                    className={`w-full border rounded-xl px-4 py-3 text-sm transition ${editing && isOwner ? 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    value={profileForm.lastName || ''}
                    onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    disabled={!editing || !isOwner}
                    className={`w-full border rounded-xl px-4 py-3 text-sm transition ${editing && isOwner ? 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                  />
                </div>
              </>
            )}

            {profile?.userType === 'ATHLETE' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                  <input
                    type="date"
                    value={profileForm.birthDate || ''}
                    onChange={e => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                    disabled={!editing || !isOwner}
                    className={`w-full border rounded-xl px-4 py-3 text-sm transition ${editing && isOwner ? 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
                  <input
                    type="text"
                    value={profileForm.nationality || ''}
                    onChange={e => setProfileForm({ ...profileForm, nationality: e.target.value })}
                    disabled={!editing || !isOwner}
                    className={`w-full border rounded-xl px-4 py-3 text-sm transition ${editing && isOwner ? 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deportes</label>
                  <div className="flex flex-wrap gap-2">
                    {sports.map(sport => (
                      <button
                        key={sport.id}
                        type="button"
                        onClick={() => editing && isOwner && toggleSport(sport.id)}
                        className="px-4 py-2 rounded-xl text-sm font-medium border-2 transition"
                        style={{
                          borderColor: (profileForm.sportIds || []).includes(sport.id) ? '#2D3A8C' : '#e5e7eb',
                          backgroundColor: (profileForm.sportIds || []).includes(sport.id) ? '#2D3A8C' : 'white',
                          color: (profileForm.sportIds || []).includes(sport.id) ? 'white' : '#6b7280',
                          cursor: editing && isOwner ? 'pointer' : 'default',
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
                          onClick={() => editing && isOwner && togglePosition(pos.id)}
                          className="px-4 py-2 rounded-xl text-sm font-medium border-2 transition"
                          style={{
                            borderColor: (profileForm.positionIds || []).includes(pos.id) ? '#7DD4E8' : '#e5e7eb',
                            backgroundColor: (profileForm.positionIds || []).includes(pos.id) ? '#7DD4E8' : 'white',
                            color: (profileForm.positionIds || []).includes(pos.id) ? 'white' : '#6b7280',
                            cursor: editing && isOwner ? 'pointer' : 'default',
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
                    id="isSigned"
                    checked={profileForm.isSigned || false}
                    onChange={e => setProfileForm({ ...profileForm, isSigned: e.target.checked })}
                    disabled={!editing || !isOwner}
                    className="w-4 h-4 accent-blue-700"
                  />
                  <label htmlFor="isSigned" className="text-sm text-gray-700">
                    Actualmente estoy fichado
                  </label>
                </div>
              </>
            )}

            {profile?.userType === 'CLUB' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del club</label>
                  <input
                    type="text"
                    value={profileForm.name || ''}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    disabled={!editing || !isOwner}
                    className={`w-full border rounded-xl px-4 py-3 text-sm transition ${editing && isOwner ? 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={profileForm.address || ''}
                    onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                    disabled={!editing || !isOwner}
                    className={`w-full border rounded-xl px-4 py-3 text-sm transition ${editing && isOwner ? 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fundación</label>
                  <input
                    type="date"
                    value={profileForm.openingDate || ''}
                    onChange={e => setProfileForm({ ...profileForm, openingDate: e.target.value })}
                    disabled={!editing || !isOwner}
                    className={`w-full border rounded-xl px-4 py-3 text-sm transition ${editing && isOwner ? 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* BOTONES */}
        {isOwner && (
          <div className="flex justify-end gap-3">
            {editing ? (
              <>
                <button
                  onClick={() => { setEditing(false); loadProfile() }}
                  className="px-6 py-3 rounded-xl font-semibold text-white text-sm transition"
                  style={{ backgroundColor: '#ef4444' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ef4444'}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-semibold text-white text-sm transition disabled:opacity-50"
                  style={{ backgroundColor: '#22c55e' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#16a34a'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#22c55e'}
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-3 rounded-xl font-semibold text-white text-sm transition"
                style={{ backgroundColor: '#2D3A8C' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7DD4E8'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2D3A8C'}
              >
                Editar perfil
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}