import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

// Hook raccourci — au lieu d'écrire useContext(AuthContext) partout
// tu écris juste useAuth()
export function useAuth() {
  return useContext(AuthContext)
}