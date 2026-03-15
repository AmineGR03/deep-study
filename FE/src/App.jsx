import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

// Pages publiques
import LoginPage    from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'

// Pages etudiants
import LibraryPage from './pages/student/LibraryPage'
import ChatPage from './pages/student/ChatPage'
import HistoryPage from './pages/student/HistoryPage'
import StudentDashboard from './pages/student/StudentDashboard'

// Pages Professeur
import ProfessorDashboard  from './pages/professor/ProfessorDashboard'
import ManageDocumentsPage from './pages/professor/ManageDocumentsPage'
import DocumentsListPage   from './pages/professor/DocumentsListPage'

// Pages Admin
import AdminDashboard    from './pages/admin/AdminDashboard'
import ManageUsersPage   from './pages/admin/ManageUsersPage'
import ManageFilieresPage    from './pages/admin/ManageFilieresPage'
import ManageSpecialitesPage from './pages/admin/ManageSpecialitesPage'
import ManageMatieresPage    from './pages/admin/ManageMatieresPage'
import ManageTypesPage       from './pages/admin/ManageTypesPage'
// import DocumentsListPage     from './pages/professor/DocumentsListPage'

// Placeholders
const HomePage           = () => (
  <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center">
    <div className="text-center animate-fade-up">
      <h1 className="font-display text-5xl font-bold text-white mb-4">
        Deep<span className="text-primary-500">Study</span>
      </h1>
      <p className="text-dark-500 mb-8">Assistant pédagogique intelligent — EMSI Rabat</p>
      <div className="flex gap-4 justify-center">
        <a href="/login"    className="ds-btn-primary">Se connecter</a>
        <a href="/register" className="ds-btn-outline">S'inscrire</a>
      </div>
    </div>
  </div>
)

// Wrapper : ProtectedRoute + AppLayout combinés
function PrivatePage({ roles, children }) {
  return (
    <ProtectedRoute allowedRoles={roles}>
      <AppLayout>
        {children}
      </AppLayout>
    </ProtectedRoute>
  )
}


//=============test========================
// function PrivatePage({ roles, children }) {
//   return <AppLayout>{children}</AppLayout>
// }

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Publiques ── */}
          <Route path="/"         element={<HomePage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Étudiant ── */}
          <Route path="/student" element={
            <PrivatePage roles={['etudiant']}><StudentDashboard /></PrivatePage>
          }/>
          <Route path="/student/library" element={
            <PrivatePage roles={['etudiant']}><LibraryPage /></PrivatePage>
          }/>
          <Route path="/student/chat" element={
            <PrivatePage roles={['etudiant']}><ChatPage /></PrivatePage>
          }/>
          <Route path="/student/history" element={
            <PrivatePage roles={['etudiant']}><HistoryPage /></PrivatePage>
          }/>

          {/* ── Professeur ── */}
          <Route path="/professor" element={
            <PrivatePage roles={['professeur']}><ProfessorDashboard /></PrivatePage>
          }/>
          <Route path="/professor/upload" element={
            <PrivatePage roles={['professeur', 'admin']}><ManageDocumentsPage /></PrivatePage>
          }/>
          <Route path="/professor/documents" element={
            <PrivatePage roles={['professeur', 'admin']}><DocumentsListPage /></PrivatePage>
          }/>

          {/* ── Admin ── */}
          <Route path="/admin" element={
            <PrivatePage roles={['admin']}><AdminDashboard /></PrivatePage>
          }/>
          <Route path="/admin/users" element={
            <PrivatePage roles={['admin']}><ManageUsersPage /></PrivatePage>
          }/>
          <Route path="/admin/filieres" element={
            <PrivatePage roles={['admin']}><ManageFilieresPage /></PrivatePage>
          }/>
          <Route path="/admin/specialites" element={
            <PrivatePage roles={['admin']}><ManageSpecialitesPage /></PrivatePage>
          }/>
          <Route path="/admin/matieres" element={
            <PrivatePage roles={['admin']}><ManageMatieresPage /></PrivatePage>
          }/>
          <Route path="/admin/types" element={
            <PrivatePage roles={['admin']}><ManageTypesPage /></PrivatePage>
          }/>
          <Route path="/admin/documents" element={
            <PrivatePage roles={['admin', 'professeur']}><DocumentsListPage /></PrivatePage>
          }/>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}