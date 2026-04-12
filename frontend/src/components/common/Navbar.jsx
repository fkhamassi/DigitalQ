// src/components/common/Navbar.jsx

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// ─── LOGO SVG ────────────────────────────────────────────────
// Concept : carré arrondi indigo + 3 barres blanches de longueurs variées
// → évoque une file d'attente / liste de tickets (style Linear/Notion)
function LogoMark() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Fond : carré arrondi indigo profond */}
      <rect width="32" height="32" rx="9" fill="#4f46e5" />

      {/* Barre 1 — pleine largeur (premier en file) */}
      <rect x="8" y="10" width="16" height="2.5" rx="1.25" fill="white" />

      {/* Barre 2 — courte (deuxième) */}
      <rect x="8" y="15" width="10" height="2.5" rx="1.25" fill="white" />

      {/* Barre 3 — intermédiaire (troisième) */}
      <rect x="8" y="20" width="13" height="2.5" rx="1.25" fill="white" />

      {/* Accent : petite pastille indigo clair en bas à droite */}
      <circle cx="23" cy="21.25" r="2.5" fill="#a5b4fc" />
    </svg>
  )
}

// ─── ICÔNE LOGOUT ────────────────────────────────────────────
function IconLogout() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
      />
    </svg>
  )
}

// ─── SÉPARATEUR VERTICAL ─────────────────────────────────────
function Divider() {
  return <span className="w-px h-4 bg-slate-200 flex-shrink-0" aria-hidden="true" />
}

// ─── NAVBAR ──────────────────────────────────────────────────
export default function Navbar({ citizenMode = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const showAgentInfo = !citizenMode && !!user

  return (
    <nav className="h-16 border-b sticky top-0 z-50" style={{ backgroundColor: '#EDE9FE', borderColor: '#DDD6FE' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">

        {/* ── LOGO ─────────────────────────────────── */}
        <Link
          to="/"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity duration-150 flex-shrink-0"
        >
          <LogoMark />
          <span className="text-xl font-semibold tracking-tight select-none">
            <span className="text-slate-800">Digital</span>
            <span className="text-indigo-600 font-bold">Q</span>
          </span>
        </Link>

        {/* ── NAVIGATION ───────────────────────────── */}
        <div className="flex items-center gap-2">

          {/* Mode citoyen ou non connecté */}
          {(citizenMode || !user) && (
            <div className="flex items-center gap-1">
              <Link
                to="/nouveau-ticket"
                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-150"
              >
                {/* Icône ticket */}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 000-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                </svg>
                Nouveau ticket
              </Link>

              <Divider />

              <Link
                to="/agent/login"
                className="text-sm text-slate-500 hover:text-indigo-600 px-3 py-2 rounded-md hover:bg-indigo-50 transition-colors duration-150"
              >
                Espace agent
              </Link>
            </div>
          )}

          {/* Mode agent / admin connecté */}
          {showAgentInfo && (
            <div className="flex items-center gap-3">

              {/* Nom + badge rôle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-700 font-medium hidden sm:block">
                  {user.firstName} {user.lastName}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                  user.role === 'admin'
                    ? 'bg-purple-50 text-purple-700'
                    : 'bg-indigo-50 text-indigo-700'
                }`}>
                  {user.role === 'admin' ? 'Admin' : 'Agent'}
                </span>
              </div>

              <Divider />

              {/* Bouton déconnexion */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-600 px-2 py-1.5 rounded-md hover:bg-red-50 transition-colors duration-150"
                title="Déconnexion"
              >
                <IconLogout />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  )
}
