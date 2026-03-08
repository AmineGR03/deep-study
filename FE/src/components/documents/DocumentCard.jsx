import { getTypeBadgeClass, formatDate } from '../../utils/formatters'

export default function DocumentCard({ doc }) {
  return (
    <div className="ds-card p-5 hover:border-primary-500/30 transition-all duration-200 hover:shadow-glow group">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-white text-sm truncate group-hover:text-primary-300 transition-colors">
            {doc.titre}
          </h3>
          <p className="text-dark-500 text-xs mt-0.5">{formatDate(doc.created_at)}</p>
        </div>
        <span className={`ds-badge shrink-0 ${getTypeBadgeClass(doc.type)}`}>
          {doc.type}
        </span>
      </div>

      {/* Métadonnées */}
      <div className="flex flex-wrap gap-2 mb-4">
        {doc.matiere_id && (
          <span className="text-xs bg-white/5 text-dark-500 px-2 py-1 rounded-lg">
            📚 {doc.matiere_id}
          </span>
        )}
        {doc.annee_id && (
          <span className="text-xs bg-white/5 text-dark-500 px-2 py-1 rounded-lg">
            🎓 Année {doc.annee_id}
          </span>
        )}
      </div>

      {/* Bouton télécharger */}
    <a 
        href={`http://localhost:5000/uploads/${doc.file_path?.split('uploads/')[1]}`}
        target="_blank"
        rel="noopener noreferrer"
        className="ds-btn-outline w-full text-center text-xs py-2 block"
    >
        📄 Voir le document
      </a>
    </div>
  )
}