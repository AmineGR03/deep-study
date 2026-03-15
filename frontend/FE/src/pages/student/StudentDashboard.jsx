import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import axiosInstance from '../../api/axiosInstance'
import { formatDate } from '../../utils/formatters'

function ProfilAcademique({ user }) {
  const [filiere, setFiliere]       = useState('')
  const [annee, setAnnee]           = useState('')
  const [specialite, setSpecialite] = useState('')

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const [filiereRes, anneeRes] = await Promise.all([
          axiosInstance.get('/data/filieres'),
          axiosInstance.get('/data/annees'),
        ])
        const foundAnnee   = anneeRes.data.find(a => a._id === user.annee_id)
        const foundFiliere = filiereRes.data.find(f => f._id === user.filiere_id)

        setAnnee(foundAnnee ? `${foundAnnee.niveau}ème année` : '')

        // Only show filière if année >= 3
        if (foundAnnee?.niveau >= 3 && foundFiliere) {
          setFiliere(foundFiliere.nom)
        }

        // Only show spécialité if année >= 4
        if (foundAnnee?.niveau >= 4 && user.specialite_id) {
          const specRes = await axiosInstance.get(`/data/specialite/${user.specialite_id}`)
          setSpecialite(specRes.data.nom)
        }
      } catch {}
    }
    load()
  }, [user])

  return (
    <div className="space-y-1">
      {annee && (
        <p className="font-display text-lg font-bold text-orange-400">{annee}</p>
      )}
      {filiere && (
        <p className="text-sm font-medium text-primary-300">{filiere}</p>
      )}
      {specialite && (
        <p className="text-xs text-accent-400">{specialite}</p>
      )}
      {!annee && !filiere && !specialite && (
        <p className="text-sm text-dark-500">—</p>
      )}
    </div>
  )
}

function EditProfileModal({ user, onClose, onSaved }) {
  const [email, setEmail]               = useState(user?.email || '')
  const [filieres, setFilieres]         = useState([])
  const [annees, setAnnees]             = useState([])
  const [specialites, setSpecialites]   = useState([])
  const [filiereId, setFiliereId]       = useState(user?.filiere_id || '')
  const [anneeId, setAnneeId]           = useState(user?.annee_id || '')
  const [specialiteId, setSpecialiteId] = useState(user?.specialite_id || '')
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')

  const selectedAnnee  = annees.find(a => a._id === anneeId)
  const showFiliere    = !!anneeId && selectedAnnee?.niveau >= 3
  const showSpecialite = showFiliere && !!filiereId && selectedAnnee?.niveau >= 4

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/data/filieres'),
      axiosInstance.get('/data/annees'),
    ]).then(([f, a]) => {
      setFilieres(f.data)
      setAnnees(a.data)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!filiereId) return setSpecialites([])
    axiosInstance.get(`/data/specialites/${filiereId}`)
      .then(r => setSpecialites(r.data))
      .catch(() => setSpecialites([]))
  }, [filiereId])

  function handleAnneeChange(e) {
    setAnneeId(e.target.value)
    setFiliereId('')
    setSpecialiteId('')
  }

  function handleFiliereChange(e) {
    setFiliereId(e.target.value)
    setSpecialiteId('')
  }

  async function handleSave() {
    if (!email.trim()) return setError('Email requis')
    setSaving(true)
    setError('')
    try {
      await axiosInstance.put('/auth/me', {
        email:         email.trim(),
        filiere_id:    showFiliere    ? (filiereId    || null) : null,
        annee_id:      anneeId        || null,
        specialite_id: showSpecialite ? (specialiteId || null) : null,
      })
      await onSaved()
      onClose()
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="ds-card w-full max-w-md p-6">

        <div className="flex items-center justify-between mb-6">
          <h2 className="ds-title text-lg">Modifier le profil</h2>
          <button onClick={onClose} className="text-dark-500 hover:text-white transition-colors text-xl">✕</button>
        </div>

        <div className="space-y-4">

          <div>
            <label className="ds-label text-xs">Adresse email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="ds-input w-full"
              placeholder="votre@email.ma"
            />
          </div>

          <div>
            <label className="ds-label text-xs">Année</label>
            <select value={anneeId} onChange={handleAnneeChange} className="ds-input w-full">
              <option value="">— Sélectionner —</option>
              {annees.map(a => (
                <option key={a._id} value={a._id}>{a.niveau}ème année</option>
              ))}
            </select>
          </div>

          {showFiliere && (
            <div>
              <label className="ds-label text-xs">Filière</label>
              <select value={filiereId} onChange={handleFiliereChange} className="ds-input w-full">
                <option value="">— Sélectionner —</option>
                {filieres.map(f => (
                  <option key={f._id} value={f._id}>{f.nom}</option>
                ))}
              </select>
            </div>
          )}

          {showSpecialite && (
            <div>
              <label className="ds-label text-xs">Spécialité</label>
              <select value={specialiteId} onChange={e => setSpecialiteId(e.target.value)} className="ds-input w-full">
                <option value="">— Sélectionner —</option>
                {specialites.map(s => (
                  <option key={s._id} value={s._id}>{s.nom}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}

        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="ds-btn-outline flex-1 text-sm">Annuler</button>
          <button onClick={handleSave} disabled={saving} className="ds-btn-primary flex-1 text-sm disabled:opacity-40">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { user, refreshProfile } = useAuth()

  const [stats, setStats]             = useState(null)
  const [recentConvs, setRecentConvs] = useState([])
  const [recentDocs, setRecentDocs]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [showEdit, setShowEdit]       = useState(false)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const convRes = await axiosInstance.get('/chat/history')
        const convs = convRes.data
        setRecentConvs(convs.slice(0, 3))

        if (user?.filiere_id) {
          const docRes = await axiosInstance.get('/documents/list', {
            params: { filiere_id: user.filiere_id }
          })
          setRecentDocs(docRes.data.slice(0, 3))
        }

        setStats({ conversations: convs.length })
      } catch {
      } finally {
        setLoading(false)
      }
    }

    if (user) loadDashboard()
  }, [user])

  const quickLinks = [
    { to: '/student/library', icon: '📂', label: 'Bibliothèque', desc: 'Accéder aux ressources',   color: 'hover:border-primary-500/30' },
    { to: '/student/chat',    icon: '🤖', label: 'Chat IA',       desc: 'Poser une question',       color: 'hover:border-accent-500/30'  },
    { to: '/student/history', icon: '🕓', label: 'Historique',    desc: 'Revoir vos conversations', color: 'hover:border-purple-500/30'  },
  ]

  return (
    <div className="animate-fade-up">

      {showEdit && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEdit(false)}
          onSaved={refreshProfile}
        />
      )}

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="ds-title text-2xl mb-1">
            Bonjour, {user?.prenom} {user?.nom} 👋
          </h1>
          <p className="ds-muted text-sm">{user?.email}</p>
          <p className="ds-muted text-xs mt-0.5">
            Bienvenue sur DeepStudy — votre assistant pédagogique IA
          </p>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="ds-btn-outline text-xs shrink-0 mt-1"
        >
          ✏️ Modifier le profil
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

            {/* Profil académique */}
            <div className="ds-card p-5 animate-fade-up-delay-3">
              <div className="text-3xl mb-2">🎓</div>
              <ProfilAcademique key={`${user?.annee_id}-${user?.filiere_id}-${user?.specialite_id}`} user={user} />
              <p className="ds-muted text-sm mt-1">Profil académique</p>
            </div>

            <div className="ds-card p-5 animate-fade-up-delay-1">
              <div className="text-3xl mb-2">💬</div>
              <div className="font-display text-3xl font-bold text-primary-400 mb-1">
                {stats?.conversations ?? 0}
              </div>
              <p className="ds-muted text-sm">Conversations</p>
            </div>

            <div className="ds-card p-5 animate-fade-up-delay-2">
              <div className="text-3xl mb-2">📂</div>
              <div className="font-display text-3xl font-bold text-accent-400 mb-1">
                {recentDocs.length > 0 ? recentDocs.length + '+' : '0'}
              </div>
              <p className="ds-muted text-sm">Documents disponibles</p>
            </div>

          </div>

          {/* Accès rapide */}
          <h2 className="ds-title text-lg mb-4">Accès rapide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {quickLinks.map((link, i) => (
              <Link key={i} to={link.to}
                className={`ds-card p-5 transition-all duration-200 hover:shadow-glow group ${link.color}`}>
                <div className="text-3xl mb-3">{link.icon}</div>
                <h3 className="ds-title text-base mb-1 group-hover:text-primary-300 transition-colors">
                  {link.label}
                </h3>
                <p className="ds-muted text-sm">{link.desc}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Conversations récentes */}
            <div className="ds-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="ds-title text-lg">Conversations récentes</h2>
                <Link to="/student/history"
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                  Voir tout →
                </Link>
              </div>
              {recentConvs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-2xl mb-2">💬</p>
                  <p className="ds-muted text-sm">Aucune conversation</p>
                  <Link to="/student/chat"
                    className="text-xs text-primary-400 hover:text-primary-300 mt-2 inline-block">
                    Démarrer une conversation →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentConvs.map(conv => (
                    <Link key={conv._id} to="/student/history"
                      className="flex items-center gap-3 p-3 bg-dark-700 rounded-xl hover:bg-dark-600 transition-colors group">
                      <span className="text-xl">💬</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-primary-300 transition-colors">
                          {conv.titre || 'Conversation'}
                        </p>
                        <p className="text-xs text-dark-500">{formatDate(conv.created_at)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Documents récents */}
            <div className="ds-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="ds-title text-lg">Documents récents</h2>
                <Link to="/student/library"
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                  Voir tout →
                </Link>
              </div>
              {recentDocs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-2xl mb-2">📂</p>
                  <p className="ds-muted text-sm">Aucun document disponible</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDocs.map(doc => (
                    <div key={doc._id}
                      className="flex items-center gap-3 p-3 bg-dark-700 rounded-xl">
                      <span className="text-xl">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{doc.titre}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-dark-500">{formatDate(doc.created_at)}</span>
                          <span className="text-xs bg-primary-500/20 text-primary-300 px-1.5 py-0.5 rounded">
                            {doc.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  )
}