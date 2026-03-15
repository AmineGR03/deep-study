import { createContext, useState, useEffect } from 'react'
import { getToken, saveToken, removeToken, isTokenValid } from '../utils/tokenUtils'
import axiosInstance from '../api/axiosInstance'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile() {
    try {
      const response = await axiosInstance.get('/auth/me')
      setUser(response.data)
    } catch {
      removeToken()
      setUser(null)
    }
  }

  useEffect(() => {
    const token = getToken()
    if (token && isTokenValid(token)) {
      fetchProfile().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(token) {
    saveToken(token)
    await fetchProfile()
  }

  function logout() {
    removeToken()
    setUser(null)
  }

  // ✅ Call this after updating profile to sync user state
  async function refreshProfile() {
    await fetchProfile()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}