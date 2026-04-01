import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { formatDate } from '../../utils/formatters'

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Étudiants',     value: stats?.etudiants,     icon: '🎓', color: 'text-primary-400' },
    { label: 'Professeurs',   value: stats?.professeurs,   icon: '👨‍🏫', color: 'text-accent-400'  },
    { label: 'Documents',     value: stats?.documents,     icon: '📂', color: 'text-orange-400'  },
    { label: 'Conversations', value: stats?.conversations, icon: '💬', color: 'text-purple-400'  },
  ]

  return (
    <div className="animate-fade-up">

      {/* Header */}
      <div className="mb-8">
        <h1 className="ds-title text-2xl mb-1">Dashboard Admin</h1>
        <p className="ds-muted">Vue globale de la plateforme DeepStudy EMSI</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats globales */}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Répartition par type */}
            <div className="ds-card p-6">
              <h2 className="ds-title text-lg mb-4">Documents par type</h2>
              {stats?.by_type?.length === 0 ? (
                <p className="ds-muted text-sm">Aucune donnée</p>
              ) : (
                <div className="space-y-3">
                  {stats?.by_type?.map((item, i) => {
                    const total = stats.documents || 1
                    const pct = Math.round((item.count / total) * 100)
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white font-medium">{item._id || 'Non défini'}</span>
                          <span className="text-dark-500">{item.count} <span className="text-xs">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Répartition par filière */}
            <div className="ds-card p-6">
              <h2 className="ds-title text-lg mb-4">Documents par filière</h2>
              {stats?.by_filiere?.length === 0 ? (
                <p className="ds-muted text-sm">Aucune donnée</p>
              ) : (
                <div className="space-y-3">
                  {stats?.by_filiere?.map((item, i) => {
                    const total = stats.documents || 1
                    const pct = Math.round((item.count / total) * 100)
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white font-medium">{item.nom}</span>
                          <span className="text-dark-500">{item.count} <span className="text-xs">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Répartition par matière */}
            <div className="ds-card p-6">
              <h2 className="ds-title text-lg mb-4">Documents par matière</h2>
              {stats?.by_matiere?.length === 0 ? (
                <p className="ds-muted text-sm">Aucune donnée</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {stats?.by_matiere?.map((item, i) => {
                    const total = stats.documents || 1
                    const pct = Math.round((item.count / total) * 100)
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white font-medium truncate mr-2">{item.nom}</span>
                          <span className="text-dark-500 shrink-0">{item.count} <span className="text-xs">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Étudiants par filière */}
            <div className="ds-card p-6">
              <h2 className="ds-title text-lg mb-4">Étudiants par filière</h2>
              {stats?.etudiants_by_filiere?.length === 0 ? (
                <p className="ds-muted text-sm">Aucune donnée</p>
              ) : (
                <div className="space-y-3">
                  {stats?.etudiants_by_filiere?.map((item, i) => {
                    const total = stats.etudiants || 1
                    const pct = Math.round((item.count / total) * 100)
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white font-medium">{item.nom}</span>
                          <span className="text-dark-500">{item.count} <span className="text-xs">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Documents récents */}
          <div className="ds-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="ds-title text-lg">Documents récents</h2>
              <Link to="/admin/documents"
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                Voir tout →
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.recent_docs?.map(doc => (
                <div key={doc._id}
                  className="flex items-center gap-3 p-3 bg-dark-700 rounded-xl">
                  <span className="text-xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{doc.titre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-dark-500">{formatDate(doc.created_at)}</span>
                      {doc.filiere_nom && (
                        <span className="text-xs bg-primary-500/20 text-primary-300 px-1.5 py-0.5 rounded">
                          {doc.filiere_nom}
                        </span>
                      )}
                      <span className="text-xs bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded">
                        {doc.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions rapides */}
          <h2 className="ds-title text-lg mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { to: '/admin/users',       icon: '👥', label: 'Comptes',           desc: 'Gérer les étudiants et professeurs', color: 'hover:border-primary-500/30' },
              { to: '/admin/filieres',    icon: '🏫', label: 'Filières',           desc: 'Ajouter et modifier les filières',   color: 'hover:border-accent-500/30'  },
              { to: '/admin/specialites', icon: '🎯', label: 'Spécialités',        desc: 'Gérer les spécialités par filière',  color: 'hover:border-purple-500/30'  },
              { to: '/admin/matieres',    icon: '📚', label: 'Matières',           desc: 'Gérer les matières',                 color: 'hover:border-orange-500/30'  },
              { to: '/admin/types',       icon: '🏷️', label: 'Types ressources',   desc: 'COURS, TP, EXAM, RESUME...',         color: 'hover:border-yellow-500/30'  },
              { to: '/admin/documents',   icon: '📂', label: 'Documents',          desc: 'Consulter et supprimer les docs',    color: 'hover:border-red-500/30'     },
            ].map((card, i) => (
              <Link key={i} to={card.to}
                className={`ds-card p-5 transition-all duration-200 hover:shadow-glow group ${card.color}`}>
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="ds-title text-base mb-1 group-hover:text-primary-300 transition-colors">
                  {card.label}
                </h3>
                <p className="ds-muted text-sm">{card.desc}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}