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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [pendingRequests, setPendingRequests] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [friends, setFriends] = useState([])
  const [friendsPage, setFriendsPage] = useState(0)
  const friendsPerPage = 10
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [postsPage, setPostsPage] = useState(1)
  const [postsMeta, setPostsMeta] = useState(null)

  useEffect(() => {
    api.get(`/users/${user.userId}`).then(({ data }) => setProfile(data.data))
    api.get('/posts?limit=6').then(({ data }) => { setPosts(data.data.data); setPostsMeta(data.data.meta) })
    loadFriendshipData()
  }, [])

  useEffect(() => {
  api.get('/users').then(({ data }) => setAllUsers(data.data))
}, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

const handlePost = async () => {
  if (!newPost.trim()) return
  setPosting(true)
  try {
    const formData = new FormData()
    formData.append('content', newPost)
    selectedFiles.forEach(file => formData.append('media', file))
    await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    await loadPosts(1)
    setPostsPage(1)
    setNewPost('')
    setSelectedFiles([])
    setPreviewUrls([])
  } catch (err) {
    console.error(err)
  } finally {
    setPosting(false)
  }
}

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/likes`)
      await loadPosts(postsPage)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSearch = (value) => {
  setSearchQuery(value)
  if (!value.trim()) {
    setShowResults(false)
    return
  }
  const filtered = allUsers.filter(u => {
    const name = getDisplayName(u).toLowerCase()
    return name.includes(value.toLowerCase())
  })
  setSearchResults(filtered)
  setShowResults(true)
}

const loadPosts = async (page) => {
  const { data } = await api.get(`/posts?page=${page}&limit=6`)
  setPosts(data.data.data)
  setPostsMeta(data.data.meta)
  setPostsPage(page)
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

const loadFriendshipData = async () => {
  try {
    const { data: pending } = await api.get('/friendships/pending/received')
    setPendingRequests(pending.data)
    const { data: friendsData } = await api.get('/friendships/friends')
    setFriends(friendsData.data)
  } catch (err) {
    console.error(err)
  }
}

const handleAccept = async (friendshipId) => {
  try {
    await api.patch(`/friendships/${friendshipId}`, { status: 'accepted' })
    loadFriendshipData()
  } catch (err) {
    console.error(err)
  }
}

const handleReject = async (friendshipId) => {
  try {
    await api.patch(`/friendships/${friendshipId}`, { status: 'rejected' })
    loadFriendshipData()
  } catch (err) {
    console.error(err)
  }
}

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f4ff' }}>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 shadow-lg" style={{ backgroundColor: '#2D3A8C' }}>
        <div className="w-full h-16 flex items-center px-4 md:px-6 gap-4 relative">

      <div className="flex-shrink-0 cursor-pointer flex items-center" onClick={() => navigate('/')}>
        <img src={logo} alt="SportLink" className="h-35 w-auto" />
      </div>

{/* BUSCADOR + CAMPANITA */}
<div className="absolute left-0 right-0 flex items-center justify-center gap-2" style={{ height: '64px' }}>
  <div className="flex items-center gap-2" style={{ width: 'min(900px, 85%)' }}>
    <div className="relative flex-1">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4"
        style={{ color: 'rgba(255,255,255,0.5)' }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={searchQuery}
        onChange={e => handleSearch(e.target.value)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        onFocus={() => searchQuery && setShowResults(true)}
        placeholder="Buscar usuarios..."
        className="w-full rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none transition-all"
        style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}
        onFocusCapture={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.borderColor = '#7DD4E8' }}
        onBlurCapture={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
      />
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg overflow-hidden z-50">
          {searchResults.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin resultados</p>
          ) : (
            searchResults.map(u => (
              <button
                key={u.id}
                onClick={() => { navigate(`/profile/${u.id}`); setShowResults(false); setSearchQuery('') }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: '#2D3A8C' }}>
                  {getInitials(u)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{getDisplayName(u)}</p>
                  <p className="text-xs text-gray-400">{u.userType}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>

    {/* CAMPANITA */}
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(125,212,232,0.25)'; e.currentTarget.style.borderColor = '#7DD4E8' }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {pendingRequests.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: '#ef4444', fontSize: '10px' }}>
            {pendingRequests.length}
          </span>
        )}
      </button>
      {showNotifications && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg w-80 overflow-hidden z-50">
          <p className="text-xs font-semibold text-gray-400 uppercase px-4 pt-4 pb-2">
            Solicitudes de amistad
          </p>
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin solicitudes pendientes</p>
          ) : (
            pendingRequests.map(req => (
              <div key={req.id} className="flex items-center gap-3 px-4 py-3 border-t border-gray-50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: '#2D3A8C' }}>
                  {getInitials(req.requester)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{getDisplayName(req.requester)}</p>
                  <p className="text-xs text-gray-400">{req.requester?.userType}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(req.id)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-white transition"
                    style={{ backgroundColor: '#22c55e' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#16a34a'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#22c55e'}>✓</button>
                  <button onClick={() => handleReject(req.id)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-white transition"
                    style={{ backgroundColor: '#ef4444' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ef4444'}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>

  </div>
</div>

  <div className="relative ml-auto flex-shrink-0">
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
</div>
</nav>

      {/* CONTENIDO */}
      <div className="flex gap-6 pt-24 px-6 pb-10" style={{ width: 'min(1000px, 85%)', margin: '0 auto' }}>

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
              {previewUrls.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                      <button
                        onClick={() => {
                          setSelectedFiles(prev => prev.filter((_, j) => j !== i))
                          setPreviewUrls(prev => prev.filter((_, j) => j !== i))
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
                        style={{ backgroundColor: '#ef4444' }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-3">
                <label className="cursor-pointer flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Agregar imagen
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => {
                      const files = Array.from(e.target.files).slice(0, 4 - selectedFiles.length)
                      setSelectedFiles(prev => [...prev, ...files])
                      setPreviewUrls(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
                      e.target.value = ''
                    }}
                  />
                </label>
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
              <p className="text-sm text-gray-700 mb-4">{post.content}</p>
              {post.media?.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-4">
                  {post.media.map((m, i) => (
                    <img key={i} src={`http://localhost:3000/${m.url}`} className="rounded-xl object-cover max-h-80 w-full" />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1 text-sm text-gray-500 transition"
                  onMouseEnter={e => e.currentTarget.style.color = '#2D3A8C'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                  </svg>
                {post.likes?.length ?? 0}
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1 text-sm text-gray-500 transition"
                  onMouseEnter={e => e.currentTarget.style.color = '#2D3A8C'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                    {postDetails[post.id]?.comments?.length ?? post.comments?.length ?? 0}
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
          {postsMeta && postsMeta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-2">
                  <button
                    onClick={() => loadPosts(postsPage - 1)}
                    disabled={!postsMeta.hasPrevPage}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-30"
                    style={{ backgroundColor: 'white', color: '#2D3A8C' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f4ff'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    ← Anterior
                  </button>
                  <span className="text-sm text-gray-400">
                    {postsPage} / {postsMeta.totalPages}
                  </span>
                  <button
                    onClick={() => loadPosts(postsPage + 1)}
                    disabled={!postsMeta.hasNextPage}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-30"
                    style={{ backgroundColor: 'white', color: '#2D3A8C' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f4ff'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
          
        </div>
        {/* PANEL DERECHO - AMIGOS */}
          <div className="w-56 flex-shrink-0 self-start">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Mis amigos</p>
              {friends.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">Todavía no tenés amigos</p>
              ) : (
                <>
                  {friends
                    .slice(friendsPage * friendsPerPage, (friendsPage + 1) * friendsPerPage)
                    .map(f => {
                      const friend = f.requester?.id === user.userId ? f.addressee : f.requester
                      return (
                        <button
                          key={f.id}
                          onClick={() => navigate(`/profile/${friend.id}`)}
                          className="w-full flex items-center gap-2 px-2 py-2 rounded-xl transition mb-1"
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f0f4ff' }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white' }}
                        >
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: '#7DD4E8' }}>
                            {getInitials(friend)}
                          </div>
                          <p className="text-sm font-medium text-gray-700 text-left truncate">{getDisplayName(friend)}</p>
                        </button>
                      )
                    })}
                  {friends.length > friendsPerPage && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => setFriendsPage(p => p - 1)}
                        disabled={friendsPage === 0}
                        className="text-xs px-2 py-1 rounded-lg transition disabled:opacity-30"
                        style={{ color: '#2D3A8C' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f4ff'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        ← Ant
                      </button>
                      <span className="text-xs text-gray-400">
                        {friendsPage + 1} / {Math.ceil(friends.length / friendsPerPage)}
                      </span>
                      <button
                        onClick={() => setFriendsPage(p => p + 1)}
                        disabled={(friendsPage + 1) * friendsPerPage >= friends.length}
                        className="text-xs px-2 py-1 rounded-lg transition disabled:opacity-30"
                        style={{ color: '#2D3A8C' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f4ff'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        Sig →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
      </div>
    </div>
  )
}