// import { createContext, useState, useEffect } from 'react'
// import { getToken, saveToken, removeToken, decodeToken, isTokenValid } from '../utils/tokenUtils'
// import axiosInstance from '../api/axiosInstance'

// export const AuthContext = createContext(null)

// export function AuthProvider({ children }) {
//   const [user, setUser]       = useState(null)
//   const [loading, setLoading] = useState(true)

//   // Charger le profil complet depuis /auth/me
//   async function fetchProfile() {
//     try {
//       const response = await axiosInstance.get('/auth/me')
//       setUser(response.data)
//     } catch {
//       removeToken()
//       setUser(null)
//     }
//   }

//   // Au démarrage : si token valide → charger le profil
//   useEffect(() => {
//     const token = getToken()
//     if (token && isTokenValid(token)) {
//       fetchProfile().finally(() => setLoading(false))
//     } else {
//       setLoading(false)
//     }
//   }, [])

//   // Après login : sauvegarder le token puis charger le profil complet
//   async function login(token) {
//     saveToken(token)
//     await fetchProfile()
//   }

//   function logout() {
//     removeToken()
//     setUser(null)
//   }

//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

import { createContext, useState } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id:    'fake-admin-id',
    nom:   'Admin',
    prenom: 'DeepStudy',
    email: 'admin@emsi.ma',
    // role:  'etudiant',         // change en 'etudiant' ou 'professeur' pour tester
    role:  'admin',         // change en 'etudiant' ou 'professeur' pour tester
    filiere_id: null,
    annee_id:   null,
  })

  function login(token) {}
  function logout() {}

  return (
    <AuthContext.Provider value={{ user, loading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}