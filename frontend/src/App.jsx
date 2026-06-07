import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Today from './pages/Today'
import History from './pages/History'
import Settings from './pages/Settings'
import ResetPassword from './pages/ResetPassword'
import LoadingSpinner from './components/LoadingSpinner'

const AppContent = () => {
  const { user, loading } = useAuth()
  const location = useLocation()

  const isResetPassword = location.pathname === '/reset-password'

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center">
        <LoadingSpinner message="Cargando..." size="large" />
      </div>
    )
  }

  return (
    <>
      {user && !isResetPassword && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Today />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App