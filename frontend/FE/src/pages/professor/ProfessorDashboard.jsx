import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import axiosInstance from '../../api/axiosInstance'
import { formatDate } from '../../utils/formatters'

const TYPE_COLORS = {
  COURS:  { bg: 'bg-primary-500/20',  text: 'text-primary-400',  border: 'border-primary-500/30'  },
  TP:     { bg: 'bg-accent-500/20',   text: 'text-accent-400',   border: 'border-accent-500/30'   },
  EXAM:   { bg: 'bg-orange-500/20',   text: 'text-orange-400',   border: 'border-orange-500/30'   },
  RESUME: { bg: 'bg-purple-500/20',   text: 'text-purple-400',   border: 'border-purple-500/30'   },
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="ds-card p-5 animate-fade-up">
      <div className="text-3xl mb-2">{icon}</div>
      <div className={`font-display text-3xl font-bold mb-1 ${color}`}>
        {value ?? '—'}
      </div>
      <p className="ds-muted text-sm">{label}</p>
    </div>
  )
}

function TypeBar({ nom, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  const colors = TYPE_COLORS[nom] || { bg: 'bg-white/10', text: 'text-white/60', border: 'border-white/10' }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`ds-badge text-xs ${colors.bg} ${colors.text} border ${colors.border}`}>
            {nom}
          </span>
          <span className="ds-muted text-xs">{count} document{count > 1 ? 's' : ''}</span>
        </div>
        <span className="text-xs font-medium ds-title">{pct}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors.bg.replace('/20', '/60')}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function ProfessorDashboard() {
  const { user } = useAuth()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance.get('/admin/professor/stats')
      .then(r => setStats(r.data))
      .catch(() => setStats({
        total_docs: 0,
        by_type: [],
        by_filiere: [],
        recent_docs: [],
      }))
      .finally(() => setLoading(false))
  }, [])

  const totalDocs = stats?.total_docs ?? 0

  return (
    <div className="animate-fade-up">

      {/* Header */}
      <div className="mb-8">
        <h1 className="ds-title text-2xl mb-1">
          Bonjour, {user?.prenom} {user?.nom} 👋
        </h1>
        <p className="ds-muted">Espace professeur — gérez vos ressources pédagogiques</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon="📂"
              value={totalDocs}
              label="Documents uploadés"
              color="text-primary-400"
            />
            <StatCard
              icon="📚"
              value={stats?.by_type?.find(t => t._id === 'COURS')?.count ?? 0}
              label="Cours"
              color="text-primary-400"
            />
            <StatCard
              icon="🧪"
              value={stats?.by_type?.find(t => t._id === 'TP')?.count ?? 0}
              label="TP"
              color="text-accent-400"
            />
            <StatCard
              icon="📝"
              value={stats?.by_type?.find(t => t._id === 'EXAM')?.count ?? 0}
              label="Examens"
              color="text-orange-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Répartition par type */}
            <div className="ds-card p-6">
              <h2 className="ds-title text-lg mb-5">Répartition par type</h2>
              {stats?.by_type?.length === 0 ? (
                <p className="ds-muted text-sm text-center py-6">Aucun document</p>
              ) : (
                <div>
                  {stats.by_type.map(t => (
                    <TypeBar
                      key={t._id}
                      nom={t._id || 'Autre'}
                      count={t.count}
                      total={totalDocs}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Répartition par filière */}
            <div className="ds-card p-6">
              <h2 className="ds-title text-lg mb-5">Répartition par filière</h2>
              {stats?.by_filiere?.length === 0 ? (
                <p className="ds-muted text-sm text-center py-6">Aucun document</p>
              ) : (
                <div className="space-y-3">
                  {stats.by_filiere.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-dark-700 rounded-xl border border-white/5">
                      <span className="ds-badge bg-primary-500/20 text-primary-300 border border-primary-500/30 text-xs">
                        {f.nom}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary-500/60 transition-all duration-700"
                            style={{ width: `${totalDocs > 0 ? (f.count / totalDocs) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium ds-title">{f.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions rapides */}
            <div className="space-y-4">
              <Link
                to="/professor/upload"
                className="ds-card p-5 hover:border-primary-500/30 hover:shadow-glow transition-all duration-200 group block"
              >
                <div className="text-2xl mb-2">📤</div>
                <h3 className="ds-title text-base mb-1 group-hover:text-primary-300 transition-colors">
                  Uploader un document
                </h3>
                <p className="ds-muted text-sm">Ajouter une nouvelle ressource</p>
              </Link>

              <Link
                to="/professor/documents"
                className="ds-card p-5 hover:border-accent-500/30 hover:shadow-glow transition-all duration-200 group block"
              >
                <div className="text-2xl mb-2">📂</div>
                <h3 className="ds-title text-base mb-1 group-hover:text-accent-300 transition-colors">
                  Mes documents
                </h3>
                <p className="ds-muted text-sm">Consulter et gérer vos ressources</p>
              </Link>
            </div>

          </div>

          {/* Documents récents */}
          <div className="ds-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="ds-title text-lg">Documents récents</h2>
              <Link
                to="/professor/documents"
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                Voir tout →
              </Link>
            </div>

            {stats?.recent_docs?.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-3">📭</p>
                <p className="ds-muted text-sm mb-4">Aucun document uploadé pour l'instant</p>
                <Link to="/professor/upload" className="ds-btn-primary text-sm">
                  Uploader mon premier document
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recent_docs.map(doc => {
                  const colors = TYPE_COLORS[doc.type] || { bg: 'bg-white/10', text: 'text-white/60', border: 'border-white/10' }
                  return (
                    <div
                      key={doc._id}
                      className="flex items-center gap-4 p-3 bg-dark-700 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                    >
                      <span className="text-xl shrink-0">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium ds-title truncate">{doc.titre}</p>
                        <p className="text-xs ds-muted">{formatDate(doc.created_at)}</p>
                      </div>
                      <span className={`ds-badge text-xs shrink-0 ${colors.bg} ${colors.text} border ${colors.border}`}>
                        {doc.type}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}