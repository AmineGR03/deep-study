import { useState, useEffect } from 'react'
import { useDocuments } from '../../hooks/useDocuments'
import DocumentCard from '../../components/documents/DocumentCard' // Ton composant fétiche
import axiosInstance from '../../api/axiosInstance'

const TYPES = ['', 'COURS', 'TP', 'EXAM', 'RESUME']

export default function AdminDocumentsListPage() {
  const [filieres, setFilieres] = useState([])
  const [matieres, setMatieres] = useState([])

  // Filtres Admin (Pas de restriction de propriété ici)
  const [filters, setFilters] = useState({
    filiere_id: '',
    matiere_id: '',
    type: '',
    search: ''
  })

  // 1. Charger les filières pour le menu déroulant
  useEffect(() => {
    axiosInstance.get('/data/filieres')
      .then(r => setFilieres(r.data))
      .catch(() => {})
  }, [])

  // 2. Charger les matières selon la filière choisie
  useEffect(() => {
    if (filters.filiere_id) {
      axiosInstance.get('/data/matieres', { params: { filiere_id: filters.filiere_id } })
        .then(r => setMatieres(r.data))
        .catch(() => {})
    } else {
      setMatieres([])
      setFilters(prev => ({ ...prev, matiere_id: '' }))
    }
  }, [filters.filiere_id])

  // 3. Hook pour récupérer TOUS les documents du système
  const { documents, loading, error } = useDocuments(filters)

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({ filiere_id: '', matiere_id: '', type: '', search: '' })
  }

  // --- ACTION SUPPRIMER ---
const handleDelete = async (docId) => {
  if (!window.confirm("🚨 ADMIN : Supprimer définitivement ce fichier et ses index ?")) return;
  
  try {
    // Appel direct à ton backend Flask
    await axiosInstance.delete(`/documents/${docId}`); 
    
    // Refresh immédiat de l'UI (on filtre localement pour pas recharger la page)
    // Ou window.location.reload() si tu veux être sûr
    alert("Document supprimé avec succès");
    window.location.reload(); 
  } catch (err) {
    console.error(err);
    alert("Erreur lors de la suppression backend");
  }
};

// --- ACTION MODIFIER LE TITRE ---
const handleEdit = async (doc) => {
  const nouveauTitre = window.prompt("Modifier le titre du document :", doc.titre);
  
  if (nouveauTitre && nouveauTitre !== doc.titre) {
    try {
      // On envoie le PUT au backend
      await axiosInstance.put(`/documents/${doc._id}`, { 
        titre: nouveauTitre 
      });
      alert("Titre mis à jour !");
      window.location.reload();
    } catch (err) {
      alert("Erreur lors de la modification backend");
    }
  }
};

  return (
    <div className="animate-fade-up p-4">
      {/* Header Admin */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-primary-500 text-xs font-bold uppercase tracking-widest mb-1">Administration</h2>
          <h1 className="ds-title text-2xl mb-1">Gestion Globale</h1>
          <p className="ds-muted">Accès complet à toutes les ressources de la plateforme</p>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-[10px] text-dark-500 uppercase block">Total Base de Données</span>
          <span className="text-2xl font-mono font-bold text-white">{documents.length}</span>
        </div>
      </div>

      {/* Barre de Filtres */}
      <div className="ds-card p-5 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1">
            <label className="ds-label">Recherche</label>
            <input 
              name="search" 
              value={filters.search} 
              onChange={handleFilterChange}
              placeholder="🔍 Titre ou prof..." 
              className="ds-input" 
            />
          </div>

          <div>
            <label className="ds-label">Filière</label>
            <select name="filiere_id" value={filters.filiere_id} onChange={handleFilterChange} className="ds-input">
              <option value="">Toutes les filières</option>
              {filieres.map(f => <option key={f._id} value={f._id}>{f.nom}</option>)}
            </select>
          </div>

          <div>
            <label className="ds-label">Matière</label>
            <select name="matiere_id" value={filters.matiere_id} onChange={handleFilterChange} className="ds-input" disabled={!filters.filiere_id}>
              <option value="">Toutes les matières</option>
              {matieres.map(m => <option key={m._id} value={m._id}>{m.nom}</option>)}
            </select>
          </div>

          <div>
            <label className="ds-label">Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange} className="ds-input">
              {TYPES.map(t => <option key={t} value={t}>{t || 'Tous types'}</option>)}
            </select>
          </div>

          <button onClick={resetFilters} className="ds-btn-outline h-[42px] py-0">
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Grille de Documents utilisant DocumentCard */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="ds-card p-6 text-center text-red-400 border-red-500/20">{error}</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-24 ds-card border-dashed">
          <p className="text-5xl mb-4 opacity-10">📭</p>
          <p className="ds-muted">Aucun document ne correspond à vos filtres admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map(doc => (
            <DocumentCard 
              key={doc._id} 
              doc={doc} 
              isAdmin={true} 
              onDelete={() => handleDelete(doc._id)}
              onEdit={() => handleEdit(doc)}
              isProf={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}