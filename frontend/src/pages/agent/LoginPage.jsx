// src/pages/agent/LoginPage.jsx

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function AgentLoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  // Déjà connecté → rediriger (dans useEffect pour éviter crash React 19)
  useEffect(() => {
    if (user?.role === 'agent') navigate('/agent/dashboard', { replace: true })
    if (user?.role === 'admin') navigate('/admin/dashboard', { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.error('Remplissez tous les champs')
      return
    }
    setLoading(true)
    try {
      const userData = await login(form.username, form.password)
      toast.success(`Bienvenue, ${userData.firstName} !`)
      if (userData.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/agent/dashboard')
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Identifiants incorrects'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="32" height="32" rx="9" fill="#4f46e5" />
              <rect x="8" y="10" width="16" height="2.5" rx="1.25" fill="white" />
              <rect x="8" y="15" width="10" height="2.5" rx="1.25" fill="white" />
              <rect x="8" y="20" width="13" height="2.5" rx="1.25" fill="white" />
              <circle cx="23" cy="21.25" r="2.5" fill="#a5b4fc" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight select-none">
            <span className="text-slate-800">Digital</span><span className="text-indigo-600 font-bold">Q</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Espace agent municipal et admin</p>
        </div>

        {/* Card login */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="prenom.nom"
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-md font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion...
                </>
              ) : 'Se connecter'}
            </button>
          </form>

          {/* Comptes disponibles */}
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-500">
            <div className="font-medium text-slate-600 mb-1.5">Comptes disponibles :</div>
            <div className="space-y-0.5">
              <div>fatma.mansour / Fatma@2026 <span className="text-slate-400">(État Civil)</span></div>
              <div>karim.belhadj / Karim@2026 <span className="text-slate-400">(État Civil)</span></div>
              <div>sami.belhaj / Sami@2026 <span className="text-slate-400">(Urbanisme)</span></div>
              <div>rania.ouali / Rania@2026 <span className="text-slate-400">(Finances)</span></div>
              <div>nadia.chabbi / Nadia@2026 <span className="text-slate-400">(Aff. Scolaires)</span></div>
              <div>admin / Admin@2026 <span className="text-slate-400">(Admin)</span></div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
