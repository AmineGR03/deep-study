import { createContext, useState, useEffect } from 'react'
import { getToken, saveToken, removeToken, decodeToken, isTokenValid } from '../utils/tokenUtils'

// 1. Créer le contexte
export const AuthContext = createContext(null)

// 2. Provider — enveloppe toute l'app dans App.jsx
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)  // { id, role, email }
  const [loading, setLoading] = useState(true)  // true pendant la vérification initiale

  // Au démarrage : vérifier si un token valide existe déjà dans localStorage
  useEffect(() => {
    const token = getToken()
    if (token && isTokenValid(token)) {
      setUser(decodeToken(token))
    }
    setLoading(false)
  }, [])

  // Appelé après un login réussi
  function login(token) {
    saveToken(token)
    setUser(decodeToken(token))
  }

  // Appelé pour se déconnecter
  function logout() {
    removeToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}