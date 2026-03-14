// import { Navigate } from 'react-router-dom'
// import { useAuth } from '../../hooks/useAuth'

// // Protège une route selon :
// // - isConnected : l'utilisateur doit être connecté
// // - allowedRoles : tableau de rôles autorisés ex: ["etudiant"] ou ["professeur", "admin"]
// export default function ProtectedRoute({ children, allowedRoles }) {
//   const { user, loading } = useAuth()

//   // Pendant la vérification du token au démarrage → rien afficher
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-dark-900 flex items-center justify-center">
//         <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
//       </div>
//     )
//   }

//   // Pas connecté → Login
//   if (!user) {
//     return <Navigate to="/login" replace />
//   }

//   // Connecté mais mauvais rôle → page d'accueil
//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/" replace />
//   }

//   return children
// }

export default function ProtectedRoute({ children, allowedRoles }) {
  return children
}