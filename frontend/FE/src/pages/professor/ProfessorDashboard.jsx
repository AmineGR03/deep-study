import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'

export default function ProfessorDashboard() {
  const { user } = useAuth()

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="ds-title text-2xl mb-1">
          Bonjour, {user?.prenom} {user?.nom} 👋
        </h1>
        <p className="ds-muted">Espace professeur — gérez vos ressources pédagogiques</p>
      </div>

      {/* Cards raccourcis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/professor/documents"
          className="ds-card p-6 hover:border-primary-500/30 hover:shadow-glow transition-all duration-200 group">
          <div className="text-3xl mb-3">📤</div>
          <h2 className="ds-title text-lg mb-1 group-hover:text-primary-300 transition-colors">
            Mes documents
          </h2>
          <p className="ds-muted text-sm">Uploader, consulter et supprimer vos ressources</p>
        </Link>

        <div className="ds-card p-6 opacity-50 cursor-not-allowed">
          <div className="text-3xl mb-3">📊</div>
          <h2 className="ds-title text-lg mb-1">Statistiques</h2>
          <p className="ds-muted text-sm">Bientôt disponible</p>
        </div>
      </div>
    </div>
  )
}