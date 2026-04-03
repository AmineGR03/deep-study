import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useDocuments } from '../../hooks/useDocuments'
import DocumentCard from '../../components/documents/DocumentCard' // Import de ton composant
import axiosInstance from '../../api/axiosInstance'

const TYPES = ['', 'COURS', 'TP', 'EXAM', 'RESUME']

export default function DocumentsListPage() {
  const { user } = useAuth()

  const [filieres, setFilieres] = useState([])
  const [annees, setAnnees] = useState([])
  const [matieres, setMatieres] = useState([])

  // État des filtres
  const [filters, setFilters] = useState({
    filiere_id: '',
    annee_id: '',
    matiere_id: '',
    type: '',
    my_docs_only: 'true' // Filtrage côté backend pour ne voir que SES docs
  })

  // Charger les données de structure au montage
  useEffect(() => {
    axiosInstance.get('/data/filieres').then(r => setFilieres(r.data)).catch(() => {})
    axiosInstance.get('/data/annees').then(r => setAnnees(r.data)).catch(() => {})
  }, [])

  // Charger les matières quand une filière change
  useEffect(() => {
    if (filters.filiere_id) {
      axiosInstance.get('/data/matieres', {
        params: { filiere_id: filters.filiere_id }
      }).then(r => setMatieres(r.data)).catch(() => {})
    } else {
      setMatieres([])
      setFilters(prev => ({ ...prev, matiere_id: '' }))
    }
  }, [filters.filiere_id])

  // Utilisation du Hook personnalisé
  const { documents, loading, error } = useDocuments(filters)

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({
      filiere_id: '',
      annee_id: '',
      matiere_id: '',
      type: '',
      my_docs_only: 'true'
    })
  }

  return (
    <div className="animate-fade-up p-4">
      <div className="mb-8">
        <h1 className="ds-title text-2xl mb-1">Mes documents</h1>
        <p className="ds-muted">Gérez les ressources que vous avez partagées</p>
      </div>

      {/* Section Filtres */}
      <div className="ds-card p-5 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="ds-label text-xs uppercase tracking-wider">Filière</label>
            <select name="filiere_id" value={filters.filiere_id} onChange={handleFilterChange} className="ds-input">
              <option value="">Toutes les filières</option>
              {filieres.map(f => <option key={f._id} value={f._id}>{f.nom}</option>)}
            </select>
          </div>

          <div>
            <label className="ds-label text-xs uppercase tracking-wider">Année</label>
            <select name="annee_id" value={filters.annee_id} onChange={handleFilterChange} className="ds-input">
              <option value="">Toutes les années</option>
              {annees.map(a => <option key={a._id} value={a._id}>{a.label}</option>)}
            </select>
          </div>

          <div>
            <label className="ds-label text-xs uppercase tracking-wider">Matière</label>
            <select name="matiere_id" value={filters.matiere_id} onChange={handleFilterChange} className="ds-input" disabled={!filters.filiere_id}>
              <option value="">Toutes les matières</option>
              {matieres.map(m => <option key={m._id} value={m._id}>{m.nom}</option>)}
            </select>
          </div>

          <div>
            <label className="ds-label text-xs uppercase tracking-wider">Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange} className="ds-input">
              {TYPES.map(t => <option key={t} value={t}>{t || 'Tous types'}</option>)}
            </select>
          </div>

          <button onClick={resetFilters} className="ds-btn-outline py-2.5 h-[42px] flex items-center justify-center">
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Grille de Documents */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center">
          {error}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-24 ds-card border-dashed">
          <p className="text-5xl mb-4 opacity-20">📂</p>
          <p className="text-white font-medium">Aucun document trouvé</p>
          <p className="ds-muted text-sm mt-1">Vous n'avez pas encore uploadé de fichiers pour ces critères.</p>
        </div>
      ) : (
        <>
          <p className="ds-muted mb-6 text-sm italic">{documents.length} document(s) personnel(s) trouvé(s)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {documents.map(doc => (
              <DocumentCard 
                key={doc._id} 
                doc={doc} 
                isOwner={true} // Optionnel : si ta carte a un style "propriétaire"
                isProf={true}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}