import { useState } from 'react'

const FILIERES = ['IIR', 'GESI', 'IAII', 'GCBTP', 'GI', 'GF']
const ANNEES   = ['1ère année', '2ème année', '3ème année', '4ème année', '5ème année']

const INITIAL = [
  { _id: '1',  nom: 'Programmation Avancée',    filiere: 'IIR', annee: '4ème année', semestre: 1 },
  { _id: '2',  nom: 'Dot Net',                  filiere: 'IIR', annee: '4ème année', semestre: 1 },
  { _id: '3',  nom: 'NoSQL',                    filiere: 'IIR', annee: '4ème année', semestre: 1 },
  { _id: '4',  nom: 'Développement Mobile',     filiere: 'IIR', annee: '4ème année', semestre: 1 },
  { _id: '5',  nom: 'Sécurité des Applications',filiere: 'IIR', annee: '4ème année', semestre: 2 },
  { _id: '6',  nom: 'Génie Logiciel',           filiere: 'IIR', annee: '4ème année', semestre: 2 },
  { _id: '7',  nom: 'Réseaux Informatiques',    filiere: 'IIR', annee: '3ème année', semestre: 1 },
  { _id: '8',  nom: 'Programmation Java',       filiere: 'IIR', annee: '3ème année', semestre: 2 },
]

export default function ManageMatieresPage() {
  const [matieres, setMatieres] = useState(INITIAL)
  const [form, setForm]   = useState({ nom: '', filiere: 'IIR', annee: '4ème année', semestre: 1 })
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterFiliere, setFilterFiliere] = useState('')
  const [filterAnnee, setFilterAnnee]     = useState('')
  const [filterSemestre, setFilterSemestre] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (editId) {
      setMatieres(prev => prev.map(m => m._id === editId ? { ...m, ...form } : m))
      setEditId(null)
    } else {
      setMatieres(prev => [...prev, { _id: Date.now().toString(), ...form }])
    }
    setForm({ nom: '', filiere: 'IIR', annee: '4ème année', semestre: 1 })
  }

  function handleEdit(m) {
    setEditId(m._id)
    setForm({ nom: m.nom, filiere: m.filiere, annee: m.annee, semestre: m.semestre })
  }

  function handleDelete(id) {
    if (!window.confirm('Supprimer cette matière ?')) return
    setMatieres(prev => prev.filter(m => m._id !== id))
  }

  const filtered = matieres.filter(m =>
    (filterFiliere  ? m.filiere   === filterFiliere  : true) &&
    (filterAnnee    ? m.annee     === filterAnnee    : true) &&
    (filterSemestre ? String(m.semestre) === filterSemestre : true) &&
    m.nom.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="ds-title text-2xl mb-1">Gestion des matières</h1>
        <p className="ds-muted">Créez, modifiez et supprimez les matières</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Formulaire */}
        <div className="ds-card p-6">
          <h2 className="ds-title text-lg mb-4">
            {editId ? '✏️ Modifier' : '➕ Nouvelle matière'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="ds-label">Nom</label>
              <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}
                placeholder="Ex: Réseaux Avancés" className="ds-input" required />
            </div>
            <div>
              <label className="ds-label">Filière</label>
              <select value={form.filiere} onChange={e => setForm({...form, filiere: e.target.value})}
                className="ds-input">
                {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="ds-label">Année</label>
              <select value={form.annee} onChange={e => setForm({...form, annee: e.target.value})}
                className="ds-input">
                {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="ds-label">Semestre</label>
              <select value={form.semestre} onChange={e => setForm({...form, semestre: Number(e.target.value)})}
                className="ds-input">
                <option value={1}>Semestre 1</option>
                <option value={2}>Semestre 2</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="ds-btn-primary flex-1">
                {editId ? 'Modifier' : 'Créer'}
              </button>
              {editId && (
                <button type="button"
                  onClick={() => { setEditId(null); setForm({ nom: '', filiere: 'IIR', annee: '4ème année', semestre: 1 }) }}
                  className="ds-btn-outline px-3">✕</button>
              )}
            </div>
          </form>
        </div>

        {/* Liste */}
        <div className="lg:col-span-2 ds-card p-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h2 className="ds-title text-lg">Matières ({filtered.length})</h2>
            <select value={filterFiliere} onChange={e => setFilterFiliere(e.target.value)}
              className="ds-input max-w-[100px]">
              <option value="">Filière</option>
              {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={filterAnnee} onChange={e => setFilterAnnee(e.target.value)}
              className="ds-input max-w-[130px]">
              <option value="">Année</option>
              {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={filterSemestre} onChange={e => setFilterSemestre(e.target.value)}
              className="ds-input max-w-[110px]">
              <option value="">Semestre</option>
              <option value="1">S1</option>
              <option value="2">S2</option>
            </select>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Rechercher..." className="ds-input max-w-[160px]" />
          </div>
          <div className="space-y-3">
            {filtered.map(m => (
              <div key={m._id} className="flex items-center justify-between gap-4 p-4 bg-dark-700 rounded-xl border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white mb-1">{m.nom}</p>
                  <div className="flex gap-2">
                    <span className="ds-badge bg-primary-500/20 text-primary-300 border border-primary-500/30 text-xs">{m.filiere}</span>
                    <span className="ds-badge bg-white/5 text-dark-500 text-xs">{m.annee}</span>
                    <span className="ds-badge bg-accent-500/20 text-accent-300 border border-accent-500/30 text-xs">S{m.semestre}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEdit(m)} className="ds-btn-outline text-xs py-1.5 px-3">✏️</button>
                  <button onClick={() => handleDelete(m._id)} className="ds-btn-danger text-xs py-1.5 px-3">🗑</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}