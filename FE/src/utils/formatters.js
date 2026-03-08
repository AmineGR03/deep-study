export function formatDate(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function formatFileSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function truncate(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '…'
}

export function getTypeBadgeClass(type) {
  const map = {
    COURS:  'bg-primary-500/20 text-primary-300 border border-primary-500/30',
    TP:     'bg-accent-500/20 text-accent-300 border border-accent-500/30',
    EXAM:   'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    RESUME: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  }
  return map[type] || 'bg-white/10 text-white/60'
}

export function getRoleBadgeClass(role) {
  const map = {
    etudiant:   'bg-accent-500/20 text-accent-300',
    professeur: 'bg-primary-500/20 text-primary-300',
    admin:      'bg-orange-500/20 text-orange-300',
  }
  return map[role] || 'bg-white/10 text-white/60'
}