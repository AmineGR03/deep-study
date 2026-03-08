import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

// Pages publiques
import LoginPage    from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'

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

const StudentDashboard   = () => <div className="ds-title text-2xl">📚 Dashboard Étudiant — à venir</div>
const LibraryPage        = () => <div className="ds-title text-2xl">📂 Bibliothèque — à venir</div>
const ChatPage           = () => <div className="ds-title text-2xl">🤖 Chat IA — à venir</div>
const HistoryPage        = () => <div className="ds-title text-2xl">🕓 Historique — à venir</div>
const ProfessorDashboard = () => <div className="ds-title text-2xl">👨‍🏫 Dashboard Prof — à venir</div>
const ManageDocuments    = () => <div className="ds-title text-2xl">📤 Gestion Documents — à venir</div>
const AdminDashboard     = () => <div className="ds-title text-2xl">⚙️ Dashboard Admin — à venir</div>

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
          <Route path="/professor/documents" element={
            <PrivatePage roles={['professeur', 'admin']}><ManageDocuments /></PrivatePage>
          }/>

          {/* ── Admin ── */}
          <Route path="/admin" element={
            <PrivatePage roles={['admin']}><AdminDashboard /></PrivatePage>
          }/>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}