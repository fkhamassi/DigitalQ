// src/pages/FeedbackPage.jsx
// Formulaire d'avis citoyen après traitement du ticket

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/common/Navbar'
import api from '../api/axios'

// ─── ÉTOILES ────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  const labels = ['', 'Très mauvais', 'Mauvais', 'Moyen', 'Bien', 'Excellent']

  return (
    <div className="text-center">
      <div className="flex justify-center gap-1 mb-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none"
          >
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill={(hovered || value) >= star ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.5}
              style={{ color: (hovered || value) >= star ? '#d97706' : '#cbd5e1' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        ))}
      </div>
      {(hovered || value) > 0 && (
        <p className="text-xs font-medium text-amber-700">{labels[hovered || value]}</p>
      )}
    </div>
  )
}

// ─── CASE À COCHER ────────────────────────────────────────────
function CheckOption({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer py-2.5 px-3 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 accent-indigo-600 cursor-pointer flex-shrink-0"
      />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  )
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────
export default function FeedbackPage() {
  const { ticketId } = useParams()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)

  const [rating, setRating] = useState(0)
  const [waitOk, setWaitOk] = useState(false)
  const [agentKind, setAgentKind] = useState(false)
  const [resolved, setResolved] = useState(false)
  const [comment, setComment] = useState('')

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await api.get(`/api/tickets/${ticketId}`)
        const t = res.data.id ? res.data : res.data.ticket
        if (!t || t.status !== 'served') {
          toast.error("Ce ticket ne peut pas recevoir d'avis")
          navigate('/')
          return
        }
        setTicket(t)
      } catch {
        toast.error('Ticket introuvable')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetchTicket()
  }, [ticketId, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/feedback', {
        ticketId: parseInt(ticketId),
        rating,
        waitOk,
        agentKind,
        resolved,
        comment: comment.trim() || null,
      })
      setSubmitted(true)
    } catch (err) {
      const msg = err.response?.data?.error || "Erreur lors de l'envoi"
      if (msg.includes('existe déjà')) {
        setAlreadyDone(true)
      } else {
        toast.error(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ─── LOADING ────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#cbd5e1" }}>
        <Navbar citizenMode />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Chargement...</p>
        </div>
      </div>
    )
  }

  // ─── DÉJÀ SOUMIS ────────────────────────────────────
  if (alreadyDone) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#cbd5e1" }}>
        <Navbar citizenMode />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Avis déjà soumis</h2>
          <p className="text-sm text-slate-500 mb-5">Un avis a déjà été enregistré pour ce ticket.</p>
          <Link
            to="/"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  // ─── SUCCÈS ─────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#cbd5e1" }}>
        <Navbar citizenMode />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Merci pour votre avis</h2>
          <p className="text-sm text-slate-500 mb-3">
            Votre retour nous aide à améliorer nos services.
          </p>
          <div className="flex justify-center gap-1 mb-5">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} className="w-5 h-5" viewBox="0 0 24 24"
                fill={s <= rating ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth={1.5}
                style={{ color: s <= rating ? '#d97706' : '#cbd5e1' }}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            ))}
          </div>
          <Link
            to="/"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  // ─── FORMULAIRE ─────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#cbd5e1" }}>
      <Navbar citizenMode />

      <div className="max-w-md mx-auto px-4 py-8">

        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">Votre avis</h1>
          <p className="text-sm text-slate-500">
            Service {ticket?.service?.name} — Ticket {ticket?.ticketNumber}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Note globale */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-4 text-center">
              Note globale
            </h3>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Questions rapides */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-3">
              Questions rapides
            </h3>
            <div className="space-y-2">
              <CheckOption
                label="L'attente était raisonnable"
                checked={waitOk}
                onChange={setWaitOk}
              />
              <CheckOption
                label="L'agent était aimable et professionnel"
                checked={agentKind}
                onChange={setAgentKind}
              />
              <CheckOption
                label="Mon problème a été résolu"
                checked={resolved}
                onChange={setResolved}
              />
            </div>
          </div>

          {/* Commentaire libre */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-3">
              Commentaire <span className="normal-case">(facultatif)</span>
            </h3>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-colors resize-none"
            />
            {comment.length > 0 && (
              <p className="text-xs text-slate-400 text-right mt-1">{comment.length}/500</p>
            )}
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-md font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Envoi en cours...
              </>
            ) : 'Envoyer mon avis'}
          </button>

          <div className="text-center">
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
              Passer — retour à l'accueil
            </Link>
          </div>

        </form>
      </div>
    </div>
  )
}
