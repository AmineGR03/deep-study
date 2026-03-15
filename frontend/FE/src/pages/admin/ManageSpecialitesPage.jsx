import { useState } from 'react'

const FILIERES = ['IIR', 'GESI', 'IAII', 'GCBTP', 'GI', 'GF']
const INITIAL = [
  { _id: '1', nom: 'DDSI', label: "Développement Digital & Systèmes d'Information", filiere: 'IIR' },
  { _id: '2', nom: 'IASD', label: "Intelligence Artificielle & Sciences des Données",  filiere: 'IIR' },
  { _id: '3', nom: 'CIR',  label: "Cybersécurité & Infrastructures Réseaux",           filiere: 'IIR' },
]

export default function ManageSpecialitesPage() {
  const [specialites, setSpecialites] = useState(INITIAL)
  const [form, setForm]   = useState({ nom: '', label: '', filiere: 'IIR' })
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterFiliere, setFilterFiliere] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (editId) {
      setSpecialites(prev => prev.map(s => s._id === editId ? { ...s, ...form } : s))
      setEditId(null)
    } else {
      setSpecialites(prev => [...prev, { _id: Date.now().toString(), ...form }])
    }
    setForm({ nom: '', label: '', filiere: 'IIR' })
  }

  function handleEdit(s) {
    setEditId(s._id)
    setForm({ nom: s.nom, label: s.label, filiere: s.filiere })
  }

  function handleDelete(id) {
    if (!window.confirm('Supprimer cette spécialité ?')) return
    setSpecialites(prev => prev.filter(s => s._id !== id))
  }

  const filtered = specialites.filter(s =>
    (filterFiliere ? s.filiere === filterFiliere : true) &&
    `${s.nom} ${s.label}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="ds-title text-2xl mb-1">Gestion des spécialités</h1>
        <p className="ds-muted">Créez, modifiez et supprimez les spécialités</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Formulaire */}
        <div className="ds-card p-6">
          <h2 className="ds-title text-lg mb-4">
            {editId ? '✏️ Modifier' : '➕ Nouvelle spécialité'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="ds-label">Abréviation</label>
              <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}
                placeholder="Ex: DDSI" className="ds-input" required />
            </div>
            <div>
              <label className="ds-label">Nom complet</label>
              <input value={form.label} onChange={e => setForm({...form, label: e.target.value})}
                placeholder="Ex: Développement Digital..." className="ds-input" required />
            </div>
            <div>
              <label className="ds-label">Filière</label>
              <select value={form.filiere} onChange={e => setForm({...form, filiere: e.target.value})}
                className="ds-input">
                {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="ds-btn-primary flex-1">
                {editId ? 'Modifier' : 'Créer'}
              </button>
              {editId && (
                <button type="button" onClick={() => { setEditId(null); setForm({ nom: '', label: '', filiere: 'IIR' }) }}
                  className="ds-btn-outline px-3">✕</button>
              )}
            </div>
          </form>
        </div>

        {/* Liste */}
        <div className="lg:col-span-2 ds-card p-6">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <h2 className="ds-title text-lg flex-1">Spécialités ({filtered.length})</h2>
            <select value={filterFiliere} onChange={e => setFilterFiliere(e.target.value)}
              className="ds-input max-w-[120px]">
              <option value="">Toutes</option>
              {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Rechercher..." className="ds-input max-w-[180px]" />
          </div>
          <div className="space-y-3">
            {filtered.map(s => (
              <div key={s._id} className="flex items-center justify-between gap-4 p-4 bg-dark-700 rounded-xl border border-white/5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="ds-badge bg-accent-500/20 text-accent-300 border border-accent-500/30">{s.nom}</span>
                    <span className="ds-badge bg-primary-500/20 text-primary-300 border border-primary-500/30 text-xs">{s.filiere}</span>
                  </div>
                  <p className="text-sm text-white/70 truncate">{s.label}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEdit(s)} className="ds-btn-outline text-xs py-1.5 px-3">✏️</button>
                  <button onClick={() => handleDelete(s._id)} className="ds-btn-danger text-xs py-1.5 px-3">🗑</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}