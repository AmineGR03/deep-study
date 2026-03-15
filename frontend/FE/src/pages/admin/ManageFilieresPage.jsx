import { useState } from 'react'

const INITIAL = [
  { _id: '1', nom: 'IIR',   label: 'Ingénierie Informatique et Réseaux' },
  { _id: '2', nom: 'GESI',  label: 'Génie Électrique et Systèmes Intelligents' },
  { _id: '3', nom: 'IAII',  label: 'Ingénierie Automatisme et Informatique Industrielle' },
  { _id: '4', nom: 'GCBTP', label: 'Génie Civil, Bâtiments et Travaux Publics' },
  { _id: '5', nom: 'GI',    label: 'Génie Industriel' },
  { _id: '6', nom: 'GF',    label: 'Génie Financier' },
]

export default function ManageFilieresPage() {
  const [filieres, setFilieres] = useState(INITIAL)
  const [form, setForm]         = useState({ nom: '', label: '' })
  const [editId, setEditId]     = useState(null)
  const [search, setSearch]     = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (editId) {
      setFilieres(prev => prev.map(f => f._id === editId ? { ...f, ...form } : f))
      setEditId(null)
    } else {
      setFilieres(prev => [...prev, { _id: Date.now().toString(), ...form }])
    }
    setForm({ nom: '', label: '' })
  }

  function handleEdit(f) {
    setEditId(f._id)
    setForm({ nom: f.nom, label: f.label })
  }

  function handleDelete(id) {
    if (!window.confirm('Supprimer cette filière ?')) return
    setFilieres(prev => prev.filter(f => f._id !== id))
  }

  const filtered = filieres.filter(f =>
    `${f.nom} ${f.label}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="ds-title text-2xl mb-1">Gestion des filières</h1>
        <p className="ds-muted">Créez, modifiez et supprimez les filières</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Formulaire */}
        <div className="ds-card p-6">
          <h2 className="ds-title text-lg mb-4">
            {editId ? '✏️ Modifier' : '➕ Nouvelle filière'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="ds-label">Abréviation</label>
              <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}
                placeholder="Ex: IIR" className="ds-input" required />
            </div>
            <div>
              <label className="ds-label">Nom complet</label>
              <input value={form.label} onChange={e => setForm({...form, label: e.target.value})}
                placeholder="Ex: Ingénierie Informatique..." className="ds-input" required />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="ds-btn-primary flex-1">
                {editId ? 'Modifier' : 'Créer'}
              </button>
              {editId && (
                <button type="button" onClick={() => { setEditId(null); setForm({ nom: '', label: '' }) }}
                  className="ds-btn-outline px-3">
                  ✕
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Liste */}
        <div className="lg:col-span-2 ds-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="ds-title text-lg">Filières ({filtered.length})</h2>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Rechercher..." className="ds-input max-w-xs" />
          </div>
          <div className="space-y-3">
            {filtered.map(f => (
              <div key={f._id} className="flex items-center justify-between gap-4 p-4 bg-dark-700 rounded-xl border border-white/5">
                <div>
                  <span className="ds-badge bg-primary-500/20 text-primary-300 border border-primary-500/30 mr-2">
                    {f.nom}
                  </span>
                  <span className="text-sm text-white">{f.label}</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEdit(f)} className="ds-btn-outline text-xs py-1.5 px-3">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(f._id)} className="ds-btn-danger text-xs py-1.5 px-3">
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}