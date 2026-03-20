// src/components/common/Navbar.jsx

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar({ citizenMode = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // Sur les pages citoyens, on n'affiche jamais les infos de l'agent connecté
  const showAgentInfo = !citizenMode && !!user

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50"
         style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Q</span>
            </div>
            <span className="font-bold text-slate-800 text-lg" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              DigitalQ
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {(citizenMode || !user) && (
              <>
                <Link
                  to="/nouveau-ticket"
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  Prendre un ticket
                </Link>
                <Link
                  to="/agent/login"
                  className="text-slate-600 text-sm font-medium hover:text-primary transition-colors"
                >
                  Espace agent
                </Link>
              </>
            )}

            {showAgentInfo && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  {user.firstName} {user.lastName}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  user.role === 'admin'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-accent/10 text-accent'
                }`}>
                  {user.role === 'admin' ? 'Admin' : 'Agent'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-slate-500 text-sm hover:text-danger transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}
