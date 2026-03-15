import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useDocuments } from '../../hooks/useDocuments'
import DocumentCard from '../../components/documents/DocumentCard'
import axiosInstance from '../../api/axiosInstance'

export default function LibraryPage() {
  const { user } = useAuth()

  const [tousLesMatieres, setTousLesMatieres] = useState([])
  const [matieresFiltrees, setMatieresFiltrees] = useState([])
  const [types, setTypes]       = useState([])
  const [semestre, setSemestre] = useState('')
  const [filters, setFilters]   = useState({
    filiere_id: '',
    matiere_id: '',
    type:       '',
  })

  // Charger les matières de l'étudiant (filière + année)
  useEffect(() => {
    if (user?.filiere_id && user?.annee_id) {
      axiosInstance.get('/data/matieres', {
        params: {
          filiere_id: user.filiere_id,
          annee_id:   user.annee_id,
        }
      })
      .then(r => {
        setTousLesMatieres(r.data)
      })
      .catch(() => {})

      setFilters(prev => ({ ...prev, filiere_id: user.filiere_id }))
    }
  }, [user])

  // Charger les types de ressources depuis la BD
  useEffect(() => {
    axiosInstance.get('/data/types')
      .then(r => setTypes(r.data))
      .catch(() => {
        // Fallback si route pas encore dispo
        setTypes([
          { _id: '1', nom: 'COURS'  },
          { _id: '2', nom: 'TP'     },
          { _id: '3', nom: 'EXAM'   },
          { _id: '4', nom: 'RESUME' },
        ])
      })
  }, [])

  // Filtrer les matières selon le semestre sélectionné
  useEffect(() => {
    if (semestre) {
      setMatieresFiltrees(
        tousLesMatieres.filter(m => String(m.semestre) === semestre)
      )
    } else {
      setMatieresFiltrees(tousLesMatieres)
    }
    // Reset matière quand semestre change
    setFilters(prev => ({ ...prev, matiere_id: '' }))
  }, [semestre, tousLesMatieres])

  const { documents, loading, error } = useDocuments(filters)

  function handleFilter(e) {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  function resetFilters() {
    setSemestre('')
    setFilters({ filiere_id: user?.filiere_id || '', matiere_id: '', type: '' })
  }

  return (
    <div className="animate-fade-up">

      <div className="mb-8">
        <h1 className="ds-title text-2xl mb-1">Bibliothèque</h1>
        <p className="ds-muted">Ressources pédagogiques de votre filière</p>
      </div>

      {/* Filtres */}
      <div className="ds-card p-5 mb-6">
        <div className="flex flex-wrap gap-4 items-end">

          {/* Semestre */}
          <div className="flex-1 min-w-[150px]">
            <label className="ds-label">Semestre</label>
            <select value={semestre} onChange={e => setSemestre(e.target.value)}
              className="ds-input">
              <option value="">Tous les semestres</option>
              <option value="1">Semestre 1</option>
              <option value="2">Semestre 2</option>
            </select>
          </div>

          {/* Matière — filtrée par année de l'étudiant + semestre choisi */}
          <div className="flex-1 min-w-[180px]">
            <label className="ds-label">
              Matière
              {/* <span className="text-dark-500 font-normal ml-1 text-xs">
                ({matieresFiltrees.length} disponibles)
              </span> */}
            </label>
            <select name="matiere_id" value={filters.matiere_id}
              onChange={handleFilter} className="ds-input">
              <option value="">Toutes les matières</option>
              {matieresFiltrees.map(m => (
                <option key={m._id} value={m._id}>{m.nom}</option>
              ))}
            </select>
          </div>

          {/* Type — chargé depuis la BD */}
          <div className="flex-1 min-w-[150px]">
            <label className="ds-label">Type</label>
            <select name="type" value={filters.type}
              onChange={handleFilter} className="ds-input">
              <option value="">Tous les types</option>
              {types.map(t => (
                <option key={t._id} value={t.nom}>{t.nom}</option>
              ))}
            </select>
          </div>

          <button onClick={resetFilters} className="ds-btn-outline py-3 px-4">
            Réinitialiser
          </button>
        </div>
      </div>

      {/* États */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {!loading && !error && documents.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📂</p>
          <p className="ds-title text-lg mb-2">Aucun document trouvé</p>
          <p className="ds-muted">Aucune ressource ne correspond à vos filtres.</p>
        </div>
      )}

      {!loading && documents.length > 0 && (
        <>
          <p className="ds-muted mb-4">{documents.length} document(s) trouvé(s)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map(doc => (
              <DocumentCard key={doc._id} doc={doc} />
            ))}
          </div>
        </>
      )}

    </div>
  )
}