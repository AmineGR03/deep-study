// import { NavLink } from 'react-router-dom'
// import { useAuth } from '../../hooks/useAuth'

// const menuItems = {
//   etudiant: [
//     { path: '/student',         label: 'Tableau de bord', icon: '🏠' },
//     { path: '/student/library', label: 'Bibliothèque',    icon: '📂' },
//     { path: '/student/chat',    label: 'Chat IA',         icon: '🤖' },
//     { path: '/student/history', label: 'Historique',      icon: '🕓' },
//   ],
//   professeur: [
//     { path: '/professor',              label: 'Tableau de bord', icon: '🏠' },
//     { path: '/professor/upload',       label: 'Uploader',        icon: '📤' },
//     { path: '/professor/documents',    label: 'Mes documents',   icon: '📂' },
//   ],
//   admin: [
//     { path: '/admin',           label: 'Dashboard',    icon: '⚙️' },
//     { path: '/admin/users',     label: 'Utilisateurs', icon: '👥' },
//     { path: '/admin/documents', label: 'Documents',    icon: '📂' },
//   ],
// }

// export default function Sidebar() {
//   const { user } = useAuth()
//   if (!user) return null

//   const items = menuItems[user.role] || []

//   return (
//     <aside className="w-60 bg-dark-800 border-r border-white/5 fixed top-16 left-0 bottom-0 flex flex-col py-6 px-3">
//       <nav className="flex flex-col gap-1">
//         {items.map((item) => (
//           <NavLink
//             key={item.path}
//             to={item.path}
//             end={item.path === '/student' || item.path === '/professor' || item.path === '/admin'}
//             className={({ isActive }) =>
//               `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
//               ${isActive
//                 ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
//                 : 'text-dark-500 hover:text-white hover:bg-white/5'
//               }`
//             }
//           >
//             <span className="text-base">{item.icon}</span>
//             {item.label}
//           </NavLink>
//         ))}
//       </nav>

//       <div className="mt-auto px-4">
//         <div className="border-t border-white/5 pt-4">
//           <p className="text-xs text-dark-500">DeepStudy EMSI</p>
//           <p className="text-xs text-dark-500 opacity-50">Ramadan AI 2026</p>
//         </div>
//       </div>
//     </aside>
//   )
// }

import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const menuItems = {
  etudiant: [
    { path: '/student',         label: 'Tableau de bord', icon: '🏠' },
    { path: '/student/library', label: 'Bibliothèque',    icon: '📂' },
    { path: '/student/chat',    label: 'Chat IA',         icon: '🤖' },
    { path: '/student/history', label: 'Historique',      icon: '🕓' },
  ],
  professeur: [
    { path: '/professor',            label: 'Tableau de bord', icon: '🏠' },
    { path: '/professor/upload',     label: 'Uploader',        icon: '📤' },
    { path: '/professor/documents',  label: 'Mes documents',   icon: '📂' },
  ],
  admin: [
    { path: '/admin',                   label: 'Dashboard',         icon: '🏠' },
    { path: '/admin/users',             label: 'Comptes',           icon: '👥' },
    { path: '/admin/filieres',          label: 'Filières',          icon: '🏫' },
    { path: '/admin/specialites',       label: 'Spécialités',       icon: '🎯' },
    { path: '/admin/matieres',          label: 'Matières',          icon: '📚' },
    { path: '/admin/types',             label: 'Types ressources',  icon: '🏷️' },
    { path: '/admin/documents',         label: 'Documents',         icon: '📂' },
  ],
}

export default function Sidebar() {
  const { user } = useAuth()
  if (!user) return null
  const items = menuItems[user.role] || []

  return (
    <aside className="w-60 bg-dark-800 border-r border-white/5 fixed top-16 left-0 bottom-0 flex flex-col py-6 px-3 overflow-y-auto">
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink key={item.path} to={item.path}
            end={['/admin', '/student', '/professor'].includes(item.path)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              ${isActive
                ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                : 'text-dark-500 hover:text-white hover:bg-white/5'}`
            }>
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-4">
        <div className="border-t border-white/5 pt-4">
          <p className="text-xs text-dark-500">DeepStudy EMSI</p>
          <p className="text-xs text-dark-500 opacity-50">Ramadan AI 2026</p>
        </div>
      </div>
    </aside>
  )
}