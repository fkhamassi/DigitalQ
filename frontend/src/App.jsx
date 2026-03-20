// src/App.jsx
// Configuration du Router + Providers globaux

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { SocketProvider } from './context/SocketContext'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages citoyens
import LandingPage from './pages/LandingPage'
import NewTicketPage from './pages/NewTicketPage'
import TrackingPage from './pages/TrackingPage'
import FeedbackPage from './pages/FeedbackPage'

// Pages agent
import AgentLoginPage from './pages/agent/LoginPage'
import AgentDashboardPage from './pages/agent/DashboardPage'

// Pages admin
import AdminLoginPage from './pages/admin/LoginPage'
import AdminDashboardPage from './pages/admin/DashboardPage'

// Route protégée selon le rôle
function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to={`/${role}/login`} replace />
  if (user.role !== role) return <Navigate to={`/${role}/login`} replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Routes citoyens */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/nouveau-ticket" element={<NewTicketPage />} />
      <Route path="/suivi/:ticketNumber" element={<TrackingPage />} />
      <Route path="/feedback/:ticketId" element={<FeedbackPage />} />

      {/* Routes agent */}
      <Route path="/agent/login" element={<AgentLoginPage />} />
      <Route path="/agent/dashboard" element={
        <ProtectedRoute role="agent">
          <AgentDashboardPage />
        </ProtectedRoute>
      } />

      {/* Routes admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute role="admin">
          <AdminDashboardPage />
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                borderRadius: '12px',
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
