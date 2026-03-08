import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { login as loginAPI } from '../../api/authAPI'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginAPI(form.email, form.password)
      login(data.token)  // Sauvegarde le token + met à jour le contexte

      // Redirection selon le rôle
      if (data.role === 'etudiant')   navigate('/student')
      if (data.role === 'professeur') navigate('/professor')
      if (data.role === 'admin')      navigate('/admin')

    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-up">

        {/* Logo / Titre */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Deep<span className="text-primary-500">Study</span>
          </h1>
          <p className="text-dark-500 text-sm">Assistant pédagogique EMSI</p>
        </div>

        {/* Carte formulaire */}
        <div className="ds-card p-8">
          <h2 className="font-display text-xl font-semibold text-white mb-6">Connexion</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="ds-label">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@emsi.ma"
                className="ds-input"
                required
              />
            </div>

            <div>
              <label className="ds-label">Mot de passe</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="ds-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="ds-btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Se connecter'}
            </button>
          </form>
        </div>

        {/* Lien register */}
        <p className="text-center text-dark-500 text-sm mt-5">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 transition-colors">
            S'inscrire
          </Link>
        </p>

      </div>
    </div>
  )
}