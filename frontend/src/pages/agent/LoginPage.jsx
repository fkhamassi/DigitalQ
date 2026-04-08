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
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
               style={{ boxShadow: 'var(--shadow-lg)' }}>
            <span className="text-white font-bold text-2xl" style={{ fontFamily: 'DM Sans, sans-serif' }}>Q</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            DigitalQ
          </h1>
          <p className="text-slate-500 text-sm mt-1">Espace agent municipal</p>
        </div>

        {/* Card login */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8"
             style={{ boxShadow: 'var(--shadow-lg)' }}>
          <h2 className="text-lg font-semibold text-slate-800 mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Connexion
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="prenom.nom"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
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

          {/* Hint pour le dev */}
          <div className="mt-4 p-3 bg-surface rounded-lg text-xs text-slate-500">
            <div className="font-medium mb-2">Comptes disponibles :</div>
            <div className="space-y-1">
              <div>fatma.mansour / Fatma@2024 <span className="text-slate-400">(État Civil)</span></div>
              <div>karim.belhadj / Karim@2024 <span className="text-slate-400">(État Civil)</span></div>
              <div>sami.belhaj / Sami@2024 <span className="text-slate-400">(Urbanisme)</span></div>
              <div>rania.ouali / Rania@2024 <span className="text-slate-400">(Finances)</span></div>
              <div>nadia.chabbi / Nadia@2024 <span className="text-slate-400">(Aff. Scolaires)</span></div>
              <div>admin / Admin@2024 <span className="text-slate-400">(Admin)</span></div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-slate-400 hover:text-primary transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
