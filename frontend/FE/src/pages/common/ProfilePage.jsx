import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import axiosInstance from '../../api/axiosInstance'

function ProfilAcademique({ user }) {
  const [filiere, setFiliere]       = useState('')
  const [annee, setAnnee]           = useState('')
  const [specialite, setSpecialite] = useState('')

  useEffect(() => {
    if (!user) return

    async function load() {
      try {
        const [filiereRes, anneeRes] = await Promise.all([
          axiosInstance.get('/data/filieres'),
          axiosInstance.get('/data/annees'),
        ])

        const foundAnnee = anneeRes.data.find(a => a._id === user.annee_id)
        const foundFiliere = filiereRes.data.find(f => f._id === user.filiere_id)

        setAnnee(foundAnnee ? `${foundAnnee.niveau}ème année` : '')

        if (foundAnnee?.niveau >= 3 && foundFiliere) {
          setFiliere(foundFiliere.nom)
        } else {
          setFiliere('')
        }

        if (foundAnnee?.niveau >= 4 && user.specialite_id) {
          const specRes = await axiosInstance.get(`/data/specialite/${user.specialite_id}`)
          setSpecialite(specRes.data.nom)
        } else {
          setSpecialite('')
        }
      } catch {}
    }

    load()
  }, [user])

  return (
    <div className="space-y-1">
      {annee && (
        <p className="font-display text-lg font-bold text-orange-400">{annee}</p>
      )}
      {filiere && (
        <p className="text-sm font-medium text-primary-300">{filiere}</p>
      )}
      {specialite && (
        <p className="text-xs text-accent-400">{specialite}</p>
      )}
      {!annee && !filiere && !specialite && (
        <p className="text-sm text-dark-500">—</p>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth()
  
  const [isEditing, setIsEditing] = useState(false)
  const [email, setEmail] = useState(user?.email || '')
  const [filieres, setFilieres] = useState([])
  const [annees, setAnnees] = useState([])
  const [specialites, setSpecialites] = useState([])
  const [filiereId, setFiliereId] = useState(user?.filiere_id || '')
  const [anneeId, setAnneeId] = useState(user?.annee_id || '')
  const [specialiteId, setSpecialiteId] = useState(user?.specialite_id || '')
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const selectedAnnee = annees.find(a => a._id === anneeId)
  const showFiliere = !!anneeId && selectedAnnee?.niveau >= 3
  const showSpecialite = showFiliere && !!filiereId && selectedAnnee?.niveau >= 4

  useEffect(() => {
    if (!isEditing) return
    
    Promise.all([
      axiosInstance.get('/data/filieres'),
      axiosInstance.get('/data/annees'),
    ]).then(([f, a]) => {
      setFilieres(f.data)
      setAnnees(a.data)
    }).catch(() => {})
  }, [isEditing])

  useEffect(() => {
    if (!filiereId || !isEditing) return setSpecialites([])
    axiosInstance.get(`/data/specialites/${filiereId}`)
      .then(r => setSpecialites(r.data))
      .catch(() => setSpecialites([]))
  }, [filiereId, isEditing])

  function handleAnneeChange(e) {
    setAnneeId(e.target.value)
    setFiliereId('')
    setSpecialiteId('')
  }

  function handleFiliereChange(e) {
    setFiliereId(e.target.value)
    setSpecialiteId('')
  }

  async function handleSave() {
    setError('')
    setSuccessMessage('')

    if (!email.trim()) {
      setError('Email requis')
      return
    }

    if (showPasswordFields) {
      if (!currentPassword.trim()) {
        setError('Mot de passe actuel requis pour modifier le mot de passe')
        return
      }
      if (!newPassword.trim()) {
        setError('Nouveau mot de passe requis')
        return
      }
      if (newPassword.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères')
        return
      }
      if (newPassword !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas')
        return
      }
    }

    setSaving(true)

    try {
      const updateData = {
        email: email.trim(),
        filiere_id: showFiliere ? (filiereId || null) : null,
        annee_id: anneeId || null,
        specialite_id: showSpecialite ? (specialiteId || null) : null,
      }

      if (showPasswordFields) {
        updateData.current_password = currentPassword
        updateData.new_password = newPassword
      }

      await axiosInstance.put('/auth/me', updateData)

      setSuccessMessage('Profil mis à jour avec succès')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordFields(false)
      
      setTimeout(() => {
        setIsEditing(false)
        refreshProfile()
        setSuccessMessage('')
      }, 1500)
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="ds-title text-3xl mb-1">Mon Profil</h1>
        <p className="ds-muted">Consultez et modifiez vos informations personnelles</p>
      </div>

      {error && (
        <div className="mb-6 ds-card bg-red-900/20 border-red-500/30 p-4 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 ds-card bg-green-900/20 border-green-500/30 p-4 rounded-lg">
          <p className="text-green-400 text-sm">{successMessage}</p>
        </div>
      )}

      {!isEditing && (
        <div className="ds-card p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="ds-title text-2xl">Consultation de profil</h2>
            <button
              onClick={() => {
                setIsEditing(true)
                setEmail(user?.email || '')
                setAnneeId(user?.annee_id || '')
                setFiliereId(user?.filiere_id || '')
                setSpecialiteId(user?.specialite_id || '')
              }}
              className="ds-btn-primary text-sm"
              type="button"
            >
              ✏️ Modifier le profil
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="ds-muted text-xs mb-3 uppercase tracking-wide">Identité</p>
              <p className="font-display text-2xl text-white mb-2">
                {user?.prenom} {user?.nom}
              </p>
              <p className="ds-muted text-sm">{user?.email}</p>
              {user?.role && (
                <p className="ds-muted text-xs mt-3">
                  Rôle: <span className="text-primary-300 font-medium">
                    {user.role === 'etudiant' ? 'Étudiant' : user.role === 'professeur' ? 'Professeur' : 'Admin'}
                  </span>
                </p>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="ds-muted text-xs mb-3 uppercase tracking-wide">Profil académique</p>
              <ProfilAcademique user={user} />
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="ds-card p-8 mb-6">
          <div className="mb-6">
            <h2 className="ds-title text-2xl">Modification de profil</h2>
            <p className="ds-muted text-sm mt-1">Complétez les champs que vous souhaitez modifier</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="ds-label text-xs mb-2">Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="ds-input w-full"
                placeholder="votre@email.ma"
              />
            </div>

            <div>
              <label className="ds-label text-xs mb-2">Année</label>
              <select value={anneeId} onChange={handleAnneeChange} className="ds-input w-full">
                <option value="">— Sélectionner —</option>
                {annees.map(a => (
                  <option key={a._id} value={a._id}>{a.niveau}ème année</option>
                ))}
              </select>
            </div>

            {showFiliere && (
              <div>
                <label className="ds-label text-xs mb-2">Filière</label>
                <select value={filiereId} onChange={handleFiliereChange} className="ds-input w-full">
                  <option value="">— Sélectionner —</option>
                  {filieres.map(f => (
                    <option key={f._id} value={f._id}>{f.nom}</option>
                  ))}
                </select>
              </div>
            )}

            {showSpecialite && (
              <div>
                <label className="ds-label text-xs mb-2">Spécialité</label>
                <select
                  value={specialiteId}
                  onChange={e => setSpecialiteId(e.target.value)}
                  className="ds-input w-full"
                >
                  <option value="">— Sélectionner —</option>
                  {specialites.map(s => (
                    <option key={s._id} value={s._id}>{s.nom}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="text-primary-400 hover:text-primary-300 transition-colors text-sm font-medium"
              >
                {showPasswordFields ? '✕ Annuler la modification de mot de passe' : '🔐 Modifier le mot de passe'}
              </button>
            </div>

            {showPasswordFields && (
              <div className="space-y-4 bg-white/5 border border-white/10 rounded-lg p-4">
                <div>
                  <label className="ds-label text-xs mb-2">Mot de passe actuel</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="ds-input w-full"
                    placeholder="Entrez votre mot de passe actuel"
                  />
                </div>

                <div>
                  <label className="ds-label text-xs mb-2">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="ds-input w-full"
                    placeholder="Nouveau mot de passe (min. 6 caractères)"
                  />
                </div>

                <div>
                  <label className="ds-label text-xs mb-2">Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="ds-input w-full"
                    placeholder="Confirmez le nouveau mot de passe"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => {
                setIsEditing(false)
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
                setShowPasswordFields(false)
                setError('')
              }}
              className="ds-btn-outline flex-1 text-sm"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="ds-btn-primary flex-1 text-sm disabled:opacity-40"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
