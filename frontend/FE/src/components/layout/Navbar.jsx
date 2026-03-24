// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../../hooks/useAuth'
// import { getRoleBadgeClass } from '../../utils/formatters'


// export default function Navbar({ onToggleSidebar }) {
//   const { user, logout } = useAuth()
//   const navigate = useNavigate()

//   function handleLogout() {
//     logout()
//     navigate('/login')
//   }

//   function handleProfileClick() {
//     navigate('/profile')
//   }

//   const roleLabel = {
//     etudiant:   'Étudiant',
//     professeur: 'Professeur',
//     admin:      'Admin',
//   }

//   return (
//     <header className="h-16 bg-dark-800 border-b border-white/5 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">

//       <div className="flex items-center gap-3">
//         {/* Bouton hamburger */}
//         <button
//           onClick={onToggleSidebar}
//           className="text-dark-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 lg:hidden"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//           </svg>
//         </button>

//         {/* Bouton hamburger visible aussi sur desktop */}
//         <button
//           onClick={onToggleSidebar}
//           className="text-dark-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 hidden lg:block"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//           </svg>
//         </button>

//         <span className="font-display text-xl font-bold text-white">
//           Deep<span className="text-primary-500">Study</span>
//         </span>
//         <span className="text-dark-500 text-xs hidden sm:block">EMSI</span>
//       </div>

//       {user && (
//         <div className="flex items-center gap-4">
//           <span className={`ds-badge ${getRoleBadgeClass(user.role)}`}>
//             {roleLabel[user.role]}
//           </span>
//           <button
//             onClick={handleProfileClick}
//             className="text-primary-300 hover:text-primary-200 transition-colors text-sm hidden md:block font-medium cursor-pointer"
//             type="button"
//           >
//             {user.prenom} {user.nom}
//           </button>
//           <button onClick={handleLogout} className="ds-btn-outline text-sm py-1.5 px-3">
//             Déconnexion
//           </button>
//         </div>
//       )}
//     </header>
//   )
// }



import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { getRoleBadgeClass } from '../../utils/formatters'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleProfileClick() {
    navigate('/profile')
  }

  const roleLabel = {
    etudiant:   'Étudiant',
    professeur: 'Professeur',
    admin:      'Admin',
  }

  return (
    <header className="h-16 bg-dark-800 border-b border-white/5 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">

      <div className="flex items-center gap-3">
        {/* Bouton hamburger mobile */}
        <button
          onClick={onToggleSidebar}
          className="text-dark-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 lg:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Bouton hamburger desktop */}
        <button
          onClick={onToggleSidebar}
          className="text-dark-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 hidden lg:block"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span className="font-display text-xl font-bold text-white">
          Deep<span className="text-primary-500">Study</span>
        </span>
        <span className="text-dark-500 text-xs hidden sm:block">EMSI</span>
      </div>

      {user && (
        <div className="flex items-center gap-3">

          {/* Toggle dark / light mode */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            type="button"
            className="w-8 h-8 rounded-lg border border-white/10 bg-white/5
                       hover:bg-white/10 hover:border-white/20
                       flex items-center justify-center
                       transition-all duration-200 text-sm"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

       
         <span className={`ds-badge ${getRoleBadgeClass(user.role)} 
           ring-1 ring-inset
             ${theme === 'light'
            ? 'ring-current/30 font-semibold'
            : 'ring-transparent'}`}>
          {roleLabel[user.role]}
         </span>

          <button
            onClick={handleProfileClick}
            className="text-primary-300 hover:text-primary-200 transition-colors text-sm hidden md:block font-medium cursor-pointer"
            type="button"
          >
            {user.prenom} {user.nom}
          </button>

          <button onClick={handleLogout} className="ds-btn-outline text-sm py-1.5 px-3">
            Déconnexion
          </button>

        </div>
      )}
    </header>
  )
}