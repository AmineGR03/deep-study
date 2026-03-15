// import { useState, useEffect } from 'react'
// import { Link } from 'react-router-dom'
// import axiosInstance from '../../api/axiosInstance'

// export default function AdminDashboard() {
//   const [stats, setStats]     = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     axiosInstance.get('/admin/stats')
//       .then(r => setStats(r.data))
//       .catch(() => {})
//       .finally(() => setLoading(false))
//   }, [])

//   const cards = stats ? [
//     { label: 'Étudiants',      value: stats.etudiants,     icon: '🎓', color: 'text-primary-400' },
//     { label: 'Professeurs',    value: stats.professeurs,   icon: '👨‍🏫', color: 'text-accent-400'  },
//     { label: 'Documents',      value: stats.documents,     icon: '📂', color: 'text-orange-400'  },
//     { label: 'Conversations',  value: stats.conversations, icon: '💬', color: 'text-purple-400'  },
//   ] : []

//   return (
//     <div className="animate-fade-up">
//       <div className="mb-8">
//         <h1 className="ds-title text-2xl mb-1">Dashboard Admin</h1>
//         <p className="ds-muted">Vue globale de la plateforme DeepStudy</p>
//       </div>

//       {/* Stats */}
//       {loading ? (
//         <div className="flex justify-center py-10">
//           <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       ) : (
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           {cards.map((card, i) => (
//             <div key={i} className={`ds-card p-5 animate-fade-up-delay-${i+1}`}>
//               <div className="text-3xl mb-2">{card.icon}</div>
//               <div className={`font-display text-3xl font-bold ${card.color} mb-1`}>
//                 {card.value}
//               </div>
//               <p className="ds-muted text-sm">{card.label}</p>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Actions rapides */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <Link to="/admin/users"
//           className="ds-card p-6 hover:border-primary-500/30 hover:shadow-glow transition-all group">
//           <div className="text-3xl mb-3">👥</div>
//           <h2 className="ds-title text-lg mb-1 group-hover:text-primary-300 transition-colors">
//             Gestion des utilisateurs
//           </h2>
//           <p className="ds-muted text-sm">Consulter, créer et supprimer des comptes</p>
//         </Link>

//         <Link to="/admin/documents"
//           className="ds-card p-6 hover:border-primary-500/30 hover:shadow-glow transition-all group">
//           <div className="text-3xl mb-3">📂</div>
//           <h2 className="ds-title text-lg mb-1 group-hover:text-primary-300 transition-colors">
//             Gestion des documents
//           </h2>
//           <p className="ds-muted text-sm">Consulter et supprimer les ressources</p>
//         </Link>
//       </div>
//     </div>
//   )
// }

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => setStats({ etudiants: 0, professeurs: 0, documents: 0, conversations: 0 }))
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Étudiants',     value: stats?.etudiants,     icon: '🎓', color: 'text-primary-400' },
    { label: 'Professeurs',   value: stats?.professeurs,   icon: '👨‍🏫', color: 'text-accent-400'  },
    { label: 'Documents',     value: stats?.documents,     icon: '📂', color: 'text-orange-400'  },
    { label: 'Conversations', value: stats?.conversations, icon: '💬', color: 'text-purple-400'  },
  ]

  const actionCards = [
    {
      to:      '/admin/users',
      icon:    '👥',
      label:   'Gestion des comptes',
      desc:    'Créer, modifier et supprimer les comptes étudiants et professeurs',
      color:   'hover:border-primary-500/30',
    },
    {
      to:      '/admin/filieres',
      icon:    '🏫',
      label:   'Gestion des filières',
      desc:    'Ajouter, modifier et supprimer les filières',
      color:   'hover:border-accent-500/30',
    },
    {
      to:      '/admin/specialites',
      icon:    '🎯',
      label:   'Gestion des spécialités',
      desc:    'Gérer les spécialités par filière',
      color:   'hover:border-purple-500/30',
    },
    {
      to:      '/admin/matieres',
      icon:    '📚',
      label:   'Gestion des matières',
      desc:    'Gérer les matières par filière, année et semestre',
      color:   'hover:border-orange-500/30',
    },
    {
      to:      '/admin/types',
      icon:    '🏷️',
      label:   'Types de ressources',
      desc:    'Gérer les types : COURS, TP, EXAM, RESUME...',
      color:   'hover:border-yellow-500/30',
    },
    {
      to:      '/admin/documents',
      icon:    '📂',
      label:   'Gestion des documents',
      desc:    'Consulter et supprimer les ressources pédagogiques',
      color:   'hover:border-red-500/30',
    },
  ]

  return (
    <div className="animate-fade-up">

      {/* Header */}
      <div className="mb-8">
        <h1 className="ds-title text-2xl mb-1">Dashboard Admin</h1>
        <p className="ds-muted">Vue globale de la plateforme DeepStudy EMSI</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <div key={i} className={`ds-card p-5 animate-fade-up-delay-${i+1}`}>
              <div className="text-3xl mb-2">{card.icon}</div>
              <div className={`font-display text-3xl font-bold ${card.color} mb-1`}>
                {card.value ?? '—'}
              </div>
              <p className="ds-muted text-sm">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <h2 className="ds-title text-lg mb-4">Actions rapides</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actionCards.map((card, i) => (
          <Link key={i} to={card.to}
            className={`ds-card p-6 transition-all duration-200 hover:shadow-glow group ${card.color}`}>
            <div className="text-3xl mb-3">{card.icon}</div>
            <h3 className="ds-title text-base mb-1 group-hover:text-primary-300 transition-colors">
              {card.label}
            </h3>
            <p className="ds-muted text-sm">{card.desc}</p>
          </Link>
        ))}
      </div>

    </div>
  )
}