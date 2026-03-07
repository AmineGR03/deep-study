import { jwtDecode } from 'jwt-decode'

const TOKEN_KEY = 'deepstudy_token'

/**
 * Sauvegarder le token JWT dans localStorage
 */
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Récupérer le token depuis localStorage
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Supprimer le token (déconnexion)
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Décoder le token pour extraire les infos user
 * Retourne : { id, role, email } ou null si token absent/invalide
 */
export function decodeToken(token) {
  if (!token) return null
  try {
    const decoded = jwtDecode(token)
    return {
      id:    decoded.sub,       // Flask-JWT met l'_id MongoDB ici
      role:  decoded.role,      // Claim custom : "etudiant" | "professeur" | "admin"
      email: decoded.email,     // Claim custom
    }
  } catch {
    return null
  }
}

/**
 * Vérifier si le token n'est pas expiré
 */
export function isTokenValid(token) {
  if (!token) return false
  try {
    const decoded = jwtDecode(token)
    const now = Date.now() / 1000  // en secondes
    return decoded.exp > now
  } catch {
    return false
  }
}
