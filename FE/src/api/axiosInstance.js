import axios from 'axios'
import { getToken, removeToken } from '../utils/tokenUtils'

/**
 * Instance Axios configurée pour DeepStudy
 * 
 * Elle fait 2 choses automatiquement :
 * 1. Ajoute le token JWT dans CHAQUE requête (tu n'as jamais à le faire manuellement)
 * 2. Déconnecte l'utilisateur si le backend répond 401 (token expiré)
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // Lit .env → http://localhost:5000
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,  // 15 secondes max par requête
})


// ── INTERCEPTEUR DE REQUÊTE ──────────────────────────────────────────────────
// S'exécute AVANT chaque appel HTTP
// → Ajoute automatiquement "Authorization: Bearer <token>" dans le header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken()           // Récupère le token depuis localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)


// ── INTERCEPTEUR DE RÉPONSE ──────────────────────────────────────────────────
// S'exécute APRÈS chaque réponse du backend
// → Si 401 (token expiré / invalide) : supprime le token et redirige vers /login
axiosInstance.interceptors.response.use(
  (response) => response,    // Réponse OK → on la laisse passer normalement
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      removeToken()
      // Rediriger vers login (sans React Router, car on est hors composant)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)


export default axiosInstance
