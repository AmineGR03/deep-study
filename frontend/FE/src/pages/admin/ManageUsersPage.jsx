import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { formatDate } from '../../utils/formatters'

export default function ManageUsersPage() {
  const [etudiants, setEtudiants]     = useState([])
  const [professeurs, setProfesseurs] = useState([])
  const [loading, setLoading]         = useState(true)
  const [deletingId, setDeletingId]   = useState(null)
  const [tab, setTab]                 = useState('etudiants')
  const [search, setSearch]           = useState('')

  // Formulaire création professeur
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '' })
  const [creating, setCreating]   = useState(false)
  const [createMsg, setCreateMsg] = useState('')
  const [createErr, setCreateErr] = useState('')

  function loadUsers() {
    setLoading(true)
    axiosInstance.get('/admin/users')
      .then(r => {
        setEtudiants(r.data.etudiants)
        setProfesseurs(r.data.professeurs)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadUsers() }, [])

  async function handleDelete(userId, role) {
    if (!window.confirm('Supprimer cet utilisateur ?')) return
    setDeletingId(userId)
    try {
      await axiosInstance.delete(`/admin/users/${userId}?role=${role}`)
      if (role === 'etudiant') setEtudiants(prev => prev.filter(u => u._id !== userId))
      else setProfesseurs(prev => prev.filter(u => u._id !== userId))
    } catch {
      alert('Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleCreateProf(e) {
    e.preventDefault()
    setCreateMsg('')
    setCreateErr('')
    setCreating(true)
    try {
      await axiosInstance.post('/admin/professors', form)
      setCreateMsg('✅ Professeur créé avec succès')
      setForm({ nom: '', prenom: '', email: '', password: '' })
      loadUsers()
    } catch (err) {
      setCreateErr(err.response?.data?.error || 'Erreur lors de la création')
    } finally {
      setCreating(false)
    }
  }

  const filteredEtudiants  = etudiants.filter(u =>
    `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase()))
  const filteredProfesseurs = professeurs.filter(u =>
    `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase()))

  const currentList = tab === 'etudiants' ? filteredEtudiants : filteredProfesseurs

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="ds-title text-2xl mb-1">Gestion des utilisateurs</h1>
          <p className="ds-muted">Gérez les comptes étudiants et professeurs</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="ds-btn-primary text-sm">
          {showForm ? '✕ Fermer' : '+ Nouveau professeur'}
        </button>
      </div>

      {/* Formulaire création professeur */}
      {showForm && (
        <div className="ds-card p-6 mb-6 animate-fade-in">
          <h2 className="ds-title text-lg mb-4">Créer un compte professeur</h2>
          {createMsg && (
            <div className="bg-accent-500/10 border border-accent-500/30 text-accent-300 text-sm px-4 py-3 rounded-xl mb-4">
              {createMsg}
            </div>
          )}
          {createErr && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
              {createErr}
            </div>
          )}
          <form onSubmit={handleCreateProf} className="grid grid-cols-2 gap-4">
            <div>
              <label className="ds-label">Nom</label>
              <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}
                placeholder="Alami" className="ds-input" required />
            </div>
            <div>
              <label className="ds-label">Prénom</label>
              <input value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})}
                placeholder="Mohamed" className="ds-input" required />
            </div>
            <div>
              <label className="ds-label">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                placeholder="prof@emsi.ma" className="ds-input" required />
            </div>
            <div>
              <label className="ds-label">Mot de passe</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                placeholder="••••••••" className="ds-input" required />
            </div>
            <div className="col-span-2">
              <button type="submit" disabled={creating} className="ds-btn-primary">
                {creating
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  : 'Créer le professeur'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs + Recherche */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex bg-dark-800 rounded-xl p-1 border border-white/5">
          <button onClick={() => setTab('etudiants')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'etudiants'
                ? 'bg-primary-600 text-white'
                : 'text-dark-500 hover:text-white'
            }`}>
            Étudiants ({etudiants.length})
          </button>
          <button onClick={() => setTab('professeurs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'professeurs'
                ? 'bg-primary-600 text-white'
                : 'text-dark-500 hover:text-white'
            }`}>
            Professeurs ({professeurs.length})
          </button>
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Rechercher..."
          className="ds-input max-w-xs" />
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">👥</p>
          <p className="ds-muted">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map(u => (
            <div key={u._id}
              className="ds-card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-600/20 border border-primary-500/30
                               flex items-center justify-center font-display font-bold text-primary-300">
                  {u.prenom?.[0]}{u.nom?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{u.prenom} {u.nom}</p>
                  <p className="text-xs text-dark-500">{u.email}</p>
                  <p className="text-xs text-dark-500">Inscrit le {formatDate(u.created_at)}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(u._id, u.role || tab.slice(0, -1))}
                disabled={deletingId === u._id}
                className="ds-btn-danger text-xs shrink-0">
                {deletingId === u._id
                  ? <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                  : '🗑 Supprimer'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}