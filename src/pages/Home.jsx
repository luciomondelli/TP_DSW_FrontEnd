import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'
import logo from '../assets/SportLink-Logo-BordeBlanco.png'

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)
  const [openComments, setOpenComments] = useState({})
const [commentInputs, setCommentInputs] = useState({})
const [postDetails, setPostDetails] = useState({})

  useEffect(() => {
    api.get(`/users/${user.userId}`).then(({ data }) => setProfile(data.data))
    api.get('/posts').then(({ data }) => setPosts(data.data))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handlePost = async () => {
    if (!newPost.trim()) return
    setPosting(true)
    try {
      const { data } = await api.post('/posts', { content: newPost })
      setPosts([data.data, ...posts])
      setNewPost('')
    } catch (err) {
      console.error(err)
    } finally {
      setPosting(false)
    }
  }

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/likes`)
      const { data } = await api.get('/posts')
      setPosts(data.data)
    } catch (err) {
      console.error(err)
    }
  }

  const getDisplayName = (p) => {
    if (!p) return ''
    if (p.userType === 'ATHLETE') return `${p.athleteProfile?.firstName} ${p.athleteProfile?.lastName}`
    if (p.userType === 'CLUB') return p.clubProfile?.name
    if (p.userType === 'AGENT') return `${p.agentProfile?.firstName} ${p.agentProfile?.lastName}`
    return p.email
  }

  const getInitials = (p) => {
    if (!p) return '?'
    if (p.userType === 'ATHLETE') return `${p.athleteProfile?.firstName?.[0]}${p.athleteProfile?.lastName?.[0]}`
    if (p.userType === 'CLUB') return p.clubProfile?.name?.[0]
    if (p.userType === 'AGENT') return `${p.agentProfile?.firstName?.[0]}${p.agentProfile?.lastName?.[0]}`
    return '?'
  }

  const toggleComments = async (postId) => {
  if (openComments[postId]) {
    setOpenComments({ ...openComments, [postId]: false })
    return
  }
  try {
    const { data } = await api.get(`/posts/${postId}`)
    setPostDetails({ ...postDetails, [postId]: data.data })
    setOpenComments({ ...openComments, [postId]: true })
  } catch (err) {
    console.error(err)
  }
}

const handleComment = async (postId) => {
  const content = commentInputs[postId]
  if (!content?.trim()) return
  try {
    await api.post(`/posts/${postId}/comments`, { content })
    const { data } = await api.get(`/posts/${postId}`)
    setPostDetails({ ...postDetails, [postId]: data.data })
    setCommentInputs({ ...commentInputs, [postId]: '' })
  } catch (err) {
    console.error(err)
  }
}

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f4ff' }}>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between pl-1 pr-6 shadow-md"
      style={{ backgroundColor: '#2D3A8C' }}>
        <div className="overflow-hidden h-16 flex items-center">
        <img src={logo} alt="SportLink" className="h-40 -my-6" />
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 text-white font-semibold text-sm"
            onMouseEnter={e => e.currentTarget.style.color = '#7DD4E8'}
            onMouseLeave={e => e.currentTarget.style.color = 'white'}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: '#7DD4E8' }}>
              {getInitials(profile)}
            </div>
            {getDisplayName(profile)}
            <span className="text-xs">▼</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg w-48 overflow-hidden">
              <button
                onClick={() => navigate(`/profile/${user.userId}`)}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                Ver perfil
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm transition"
                style={{ color: '#2D3A8C' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f4ff'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* CONTENIDO */}
      <div className="flex gap-6 max-w-6xl mx-auto pt-24 px-6 pb-10">

        {/* SIDEBAR IZQUIERDO */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-3">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Explorar</p>
            {[
              { label: 'Atletas', path: '/athletes' },
              { label: 'Clubes', path: '/clubs' },
              { label: 'Agentes', path: '/agents' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-gray-600 transition mb-1"
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f0f4ff'; e.currentTarget.style.color = '#2D3A8C' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#6b7280' }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* FEED CENTRAL */}
        <div className="flex-1 flex flex-col gap-4">

          {/* CREAR POST */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="¿Qué querés compartir?"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handlePost}
                disabled={posting || !newPost.trim()}
                className="px-6 py-2 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50"
                style={{ backgroundColor: '#2D3A8C' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7DD4E8'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2D3A8C'}
              >
                {posting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>

          {/* POSTS */}
          {posts.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">
              No hay publicaciones todavía.
            </div>
          )}

          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: '#2D3A8C' }}>
                  {getInitials(post.author)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{getDisplayName(post.author)}</p>
                  <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString('es-AR')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1 text-sm text-gray-500 transition"
                  onMouseEnter={e => e.currentTarget.style.color = '#2D3A8C'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                >
                  👍 {post.likes?.length ?? 0}
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1 text-sm text-gray-500 transition"
                  onMouseEnter={e => e.currentTarget.style.color = '#2D3A8C'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                >
                  💬 {postDetails[post.id]?.comments?.length ?? post.comments?.length ?? 0}
                </button>
              </div>

              {openComments[post.id] && (
                <div className="mt-3 flex flex-col gap-4">

                  {postDetails[post.id]?.comments?.length === 0 && (
                    <p className="text-xs text-gray-400 text-center">
                      Todavía no hay comentarios
                    </p>
                  )}

                  {postDetails[post.id]?.comments?.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: '#2D3A8C' }}
                      >
                        {getInitials(comment.author)}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          {getDisplayName(comment.author)}
                        </p>
                        <p className="text-sm text-gray-600">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col gap-2 mt-1">
                    <textarea
                      value={commentInputs[post.id] || ''}
                      onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment(post.id)}
                      placeholder="Escribí un comentario..."
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleComment(post.id)}
                        className="px-6 py-2 rounded-xl text-white text-sm font-semibold transition"
                        style={{ backgroundColor: '#2D3A8C' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7DD4E8'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2D3A8C'}
                      >
                        Enviar
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}