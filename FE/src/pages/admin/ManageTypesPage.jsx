import { useState } from 'react'
import { getTypeBadgeClass } from '../../utils/formatters'

const INITIAL = [
  { _id: '1', nom: 'COURS'  },
  { _id: '2', nom: 'TP'     },
  { _id: '3', nom: 'EXAM'   },
  { _id: '4', nom: 'RESUME' },
]

export default function ManageTypesPage() {
  const [types, setTypes] = useState(INITIAL)
  const [form, setForm]   = useState({ nom: '' })
  const [editId, setEditId] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (editId) {
      setTypes(prev => prev.map(t => t._id === editId ? { ...t, ...form } : t))
      setEditId(null)
    } else {
      setTypes(prev => [...prev, { _id: Date.now().toString(), ...form }])
    }
    setForm({ nom: '' })
  }

  function handleEdit(t) {
    setEditId(t._id)
    setForm({ nom: t.nom })
  }

  function handleDelete(id) {
    if (!window.confirm('Supprimer ce type ?')) return
    setTypes(prev => prev.filter(t => t._id !== id))
  }

  return (
    <div className="animate-fade-up max-w-2xl">
      <div className="mb-8">
        <h1 className="ds-title text-2xl mb-1">Types de ressources</h1>
        <p className="ds-muted">Gérez les types de ressources pédagogiques</p>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* Formulaire */}
        <div className="ds-card p-6">
          <h2 className="ds-title text-lg mb-4">
            {editId ? '✏️ Modifier' : '➕ Nouveau type'}
          </h2>
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="ds-label">Nom du type</label>
              <input value={form.nom} onChange={e => setForm({ nom: e.target.value.toUpperCase() })}
                placeholder="Ex: COURS" className="ds-input" required />
            </div>
            <button type="submit" className="ds-btn-primary">
              {editId ? 'Modifier' : 'Créer'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm({ nom: '' }) }}
                className="ds-btn-outline px-3">✕</button>
            )}
          </form>
        </div>

        {/* Liste */}
        <div className="ds-card p-6">
          <h2 className="ds-title text-lg mb-4">Types existants ({types.length})</h2>
          <div className="flex flex-wrap gap-3">
            {types.map(t => (
              <div key={t._id}
                className="flex items-center gap-3 px-4 py-3 bg-dark-700 rounded-xl border border-white/5">
                <span className={`ds-badge ${getTypeBadgeClass(t.nom)}`}>{t.nom}</span>
                <button onClick={() => handleEdit(t)} className="text-dark-500 hover:text-white text-xs transition-colors">✏️</button>
                <button onClick={() => handleDelete(t._id)} className="text-dark-500 hover:text-red-400 text-xs transition-colors">🗑</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}