import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getRoleBadgeClass } from '../../utils/formatters'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const roleLabel = {
    etudiant:   'Étudiant',
    professeur: 'Professeur',
    admin:      'Admin',
  }

  return (
    <header className="h-16 bg-dark-800 border-b border-white/5 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
      
      {/* Logo */}
      <div className="flex items-center gap-3">
        <span className="font-display text-xl font-bold text-white">
          Deep<span className="text-primary-500">Study</span>
        </span>
        <span className="text-dark-500 text-xs hidden sm:block">EMSI</span>
      </div>

      {/* Infos user + Logout */}
      {user && (
        <div className="flex items-center gap-4">
          {/* Badge rôle */}
          <span className={`ds-badge ${getRoleBadgeClass(user.role)}`}>
            {roleLabel[user.role]}
          </span>

          {/* Email */}
          <span className="text-dark-500 text-sm hidden md:block">
            {user.email}
          </span>

          {/* Bouton logout */}
          <button
            onClick={handleLogout}
            className="ds-btn-outline text-sm py-1.5 px-3"
          >
            Déconnexion
          </button>
        </div>
      )}
    </header>
  )
}