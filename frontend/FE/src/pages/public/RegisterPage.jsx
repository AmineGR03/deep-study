import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerAPI } from '../../api/authAPI'
import axiosInstance from '../../api/axiosInstance'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nom: '', prenom: '', email: '',
    password: '', confirmPassword: '',
    role: 'etudiant',
    filiere_id: '', annee_id: '', specialite_id: ''
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const [filieres, setFilieres]       = useState([])
  const [annees, setAnnees]           = useState([])
  const [specialites, setSpecialites] = useState([])

  useEffect(() => {
    axiosInstance.get('/data/filieres').then(r => setFilieres(r.data)).catch(() => {})
    axiosInstance.get('/data/annees').then(r => setAnnees(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (form.filiere_id) {
      axiosInstance.get(`/data/specialites/${form.filiere_id}`)
        .then(r => setSpecialites(r.data))
        .catch(() => setSpecialites([]))
    } else {
      setSpecialites([])
    }
  }, [form.filiere_id])

  const anneeSelectionnee = annees.find(a => a._id === form.annee_id)
  const niveauAnnee = anneeSelectionnee?.niveau || 0
  const showSpecialite = niveauAnnee >= 4 && specialites.length > 0

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      const dataToSend = {
        nom:           form.nom,
        prenom:        form.prenom,
        email:         form.email,
        password:      form.password,
        role:          form.role,
        filiere_id:    form.filiere_id,
        annee_id:      form.annee_id,
        specialite_id: form.specialite_id || null,
      }
      await registerAPI(dataToSend)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-fade-up">

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Deep<span className="text-primary-500">Study</span>
          </h1>
          <p className="text-dark-500 text-sm">Créer un compte étudiant</p>
        </div>

        <div className="ds-card p-8">
          <h2 className="font-display text-xl font-semibold text-white mb-6">Inscription</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="ds-label">Nom</label>
                <input name="nom" value={form.nom} onChange={handleChange}
                  placeholder="Alami" className="ds-input" required />
              </div>
              <div>
                <label className="ds-label">Prénom</label>
                <input name="prenom" value={form.prenom} onChange={handleChange}
                  placeholder="Mohamed" className="ds-input" required />
              </div>
            </div>

            <div>
              <label className="ds-label">Email</label>
              <input type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@emsi.ma"
                className="ds-input" required />
            </div>

            <div>
              <label className="ds-label">Mot de passe</label>
              <input type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="••••••••"
                className="ds-input" required />
            </div>

            <div>
              <label className="ds-label">Confirmer le mot de passe</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword}
                onChange={handleChange} placeholder="••••••••"
                className={`ds-input ${
                  form.confirmPassword && form.password !== form.confirmPassword
                    ? 'border-red-500/60' : ''
                }`} required />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <div>
              <label className="ds-label">Filière</label>
              <select name="filiere_id" value={form.filiere_id}
                onChange={handleChange} className="ds-input" required>
                <option value="">-- Choisir une filière --</option>
                {filieres.map(f => (
                  <option key={f._id} value={f._id}>{f.nom} — {f.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="ds-label">Année</label>
              <select name="annee_id" value={form.annee_id}
                onChange={handleChange} className="ds-input" required>
                <option value="">-- Choisir une année --</option>
                {annees.map(a => (
                  <option key={a._id} value={a._id}>{a.label}</option>
                ))}
              </select>
            </div>

            {showSpecialite && (
              <div className="animate-fade-in">
                <label className="ds-label">Spécialité</label>
                <select name="specialite_id" value={form.specialite_id}
                  onChange={handleChange} className="ds-input">
                  <option value="">-- Choisir une spécialité --</option>
                  {specialites.map(s => (
                    <option key={s._id} value={s._id}>{s.nom} — {s.label}</option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="ds-btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : "Créer mon compte"}
            </button>
          </form>
        </div>

        <p className="text-center text-dark-500 text-sm mt-5">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 transition-colors">
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  )
}