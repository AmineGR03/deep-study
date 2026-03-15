import { useState, useEffect } from 'react'
import { listDocuments, deleteDocument } from '../../api/documentsAPI'
import { getTypeBadgeClass, formatDate } from '../../utils/formatters'
import axiosInstance from '../../api/axiosInstance'

const TYPES = ['', 'COURS', 'TP', 'EXAM', 'RESUME']

export default function DocumentsListPage() {
  const [documents, setDocuments]   = useState([])
  const [filtered, setFiltered]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const [filieres, setFilieres] = useState([])
  const [annees, setAnnees]     = useState([])
  const [matieres, setMatieres] = useState([])

  const [search, setSearch]         = useState('')
  const [filterFiliere, setFilterFiliere] = useState('')
  const [filterAnnee, setFilterAnnee]     = useState('')
  const [filterMatiere, setFilterMatiere] = useState('')
  const [filterType, setFilterType]       = useState('')

  // Charger données de référence
  useEffect(() => {
    axiosInstance.get('/data/filieres').then(r => setFilieres(r.data)).catch(() => {})
    axiosInstance.get('/data/annees').then(r => setAnnees(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (filterFiliere) {
      axiosInstance.get('/data/matieres', {
        params: { filiere_id: filterFiliere }
      }).then(r => setMatieres(r.data)).catch(() => {})
    } else {
      setMatieres([])
      setFilterMatiere('')
    }
  }, [filterFiliere])

  // Charger tous les documents
  function loadDocuments() {
    setLoading(true)
    listDocuments()
      .then(data => { setDocuments(data); setFiltered(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadDocuments() }, [])

  // Filtrage côté frontend
  useEffect(() => {
    let result = [...documents]

    if (search)        result = result.filter(d =>
      d.titre?.toLowerCase().includes(search.toLowerCase()))
    if (filterFiliere) result = result.filter(d => d.filiere_id === filterFiliere)
    if (filterAnnee)   result = result.filter(d => d.annee_id   === filterAnnee)
    if (filterMatiere) result = result.filter(d => d.matiere_id === filterMatiere)
    if (filterType)    result = result.filter(d => d.type       === filterType)

    setFiltered(result)
  }, [search, filterFiliere, filterAnnee, filterMatiere, filterType, documents])

  function resetFilters() {
    setSearch('')
    setFilterFiliere('')
    setFilterAnnee('')
    setFilterMatiere('')
    setFilterType('')
  }

  async function handleDelete(docId) {
    if (!window.confirm('Supprimer ce document ? Cette action est irréversible.')) return
    setDeletingId(docId)
    try {
      await deleteDocument(docId)
      setDocuments(prev => prev.filter(d => d._id !== docId))
    } catch {
      alert('Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="ds-title text-2xl mb-1">Mes documents</h1>
        <p className="ds-muted">Consultez, filtrez et gérez vos ressources uploadées</p>
      </div>

      {/* Filtres */}
      <div className="ds-card p-5 mb-6">
        <div className="flex flex-wrap gap-3 items-end">

          {/* Recherche par titre */}
          <div className="flex-1 min-w-[200px]">
            <label className="ds-label">Recherche</label>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Titre du document..."
              className="ds-input" />
          </div>

          {/* Filière */}
          <div className="min-w-[140px]">
            <label className="ds-label">Filière</label>
            <select value={filterFiliere} onChange={e => setFilterFiliere(e.target.value)}
              className="ds-input">
              <option value="">Toutes</option>
              {filieres.map(f => (
                <option key={f._id} value={f._id}>{f.nom}</option>
              ))}
            </select>
          </div>

          {/* Année */}
          <div className="min-w-[130px]">
            <label className="ds-label">Année</label>
            <select value={filterAnnee} onChange={e => setFilterAnnee(e.target.value)}
              className="ds-input">
              <option value="">Toutes</option>
              {annees.map(a => (
                <option key={a._id} value={a._id}>{a.label}</option>
              ))}
            </select>
          </div>

          {/* Matière */}
          {matieres.length > 0 && (
            <div className="min-w-[160px]">
              <label className="ds-label">Matière</label>
              <select value={filterMatiere} onChange={e => setFilterMatiere(e.target.value)}
                className="ds-input">
                <option value="">Toutes</option>
                {matieres.map(m => (
                  <option key={m._id} value={m._id}>{m.nom}</option>
                ))}
              </select>
            </div>
          )}

          {/* Type */}
          <div className="min-w-[130px]">
            <label className="ds-label">Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="ds-input">
              {TYPES.map(t => (
                <option key={t} value={t}>{t || 'Tous'}</option>
              ))}
            </select>
          </div>

          <button onClick={resetFilters} className="ds-btn-outline py-3 px-4">
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Résultats */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📭</p>
          <p className="ds-title text-lg mb-2">Aucun document trouvé</p>
          <p className="ds-muted">Modifiez vos filtres ou uploadez un nouveau document.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <>
          <p className="ds-muted mb-4">{filtered.length} document(s)</p>
          <div className="space-y-3">
            {filtered.map(doc => (
              <div key={doc._id}
                className="flex items-center justify-between gap-4 p-4 ds-card hover:border-white/10 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`ds-badge ${getTypeBadgeClass(doc.type)}`}>{doc.type}</span>
                    <h3 className="text-sm font-medium text-white truncate">{doc.titre}</h3>
                  </div>
                  <p className="text-xs text-dark-500">
                    Ajouté le {formatDate(doc.created_at)}
                  </p>
                </div>
                <button onClick={() => handleDelete(doc._id)}
                  disabled={deletingId === doc._id}
                  className="ds-btn-danger shrink-0 text-xs">
                  {deletingId === doc._id
                    ? <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                    : '🗑 Supprimer'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}