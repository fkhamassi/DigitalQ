// src/pages/TrackingPage.jsx
// Suivi temps réel du ticket citoyen via Socket.io

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/common/Navbar'
import Badge from '../components/common/Badge'
import { useSocket } from '../context/SocketContext'
import api from '../api/axios'

// ─── ICÔNES ──────────────────────────────────────────────────
function IconClock() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
function IconBell() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function IconAlertClock() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3.5 2" />
      <path strokeLinecap="round" d="M5 3L2 6M22 6l-3-3" />
    </svg>
  )
}
function IconArrow() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

// ─── BARRE DE PROGRESSION ────────────────────────────────────
function ProgressBar({ position, total }) {
  if (!position || !total || position < 1) return null
  const pct = Math.round(100 * (1 - (position - 1) / Math.max(total, 1)))

  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-2">
        <span className="font-medium">Progression dans la file</span>
        <span className="font-semibold text-indigo-600">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
        />
      </div>
    </div>
  )
}

// ─── CARTE POSITION (en attente) ─────────────────────────────
function PositionCard({ position, total }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
      <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">
        Votre position dans la file
      </div>
      <div className="inline-flex items-baseline gap-1 mb-3">
        <span className="text-7xl font-black text-slate-900 leading-none">{position}</span>
        <span className="text-2xl text-slate-300 font-light self-end mb-2">
          {position === 1 ? 'er' : 'ème'}
        </span>
      </div>
      <div className="text-sm text-slate-400 mb-8">
        sur{' '}
        <span className="font-semibold text-slate-600">{total}</span>{' '}
        {total > 1 ? 'personnes' : 'personne'} en attente
      </div>
      <ProgressBar position={position} total={total} />
    </div>
  )
}

// ─── CARTE APPELÉ ────────────────────────────────────────────
function CalledCard({ ticket }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-8 text-center text-white"
      style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
    >
      {/* Cercles décoratifs d'arrière-plan */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

      {/* Icône animée */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '1.5s' }} />
        <div className="absolute inset-1 rounded-full bg-white/10" />
        <div className="relative w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
          <IconBell />
        </div>
      </div>

      <div className="text-xs font-bold uppercase tracking-widest text-green-100 mb-2">
        C'est votre tour
      </div>

      {/* Numéro guichet mis en valeur */}
      <div className="text-6xl font-black leading-none mb-1">
        G.{ticket.guichet?.number ?? '—'}
      </div>
      <div className="text-green-100 text-sm mb-7">
        Rendez-vous au guichet {ticket.guichet?.number}
      </div>

      {/* Avertissement */}
      <div className="relative bg-white/15 backdrop-blur-sm rounded-xl p-3.5 text-xs text-green-50 leading-relaxed border border-white/20">
        Présentez-vous rapidement — vous serez marqué absent en cas de non-présentation.
      </div>
    </div>
  )
}

// ─── CARTE ABSENT ────────────────────────────────────────────
function AbsentCard() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-8 text-center text-white"
      style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
    >
      {/* Cercles décoratifs */}
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full" />
      <div className="absolute top-4 left-4 w-16 h-16 bg-white/5 rounded-full" />

      {/* Icône */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-white/20" />
        <div className="relative w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
          <IconAlertClock />
        </div>
      </div>

      <div className="text-xs font-bold uppercase tracking-widest text-red-200 mb-2">
        Ticket expiré
      </div>

      <h2 className="text-2xl font-black text-white mb-3">Marqué absent</h2>

      <p className="text-sm text-red-100 leading-relaxed mb-7 max-w-xs mx-auto">
        Vous n'étiez pas présent lors de l'appel de votre numéro. Votre ticket a été annulé.
      </p>

      {/* Encadré d'info */}
      <div className="relative bg-white/15 border border-white/20 rounded-xl p-3.5 mb-7 text-xs text-red-50 leading-relaxed">
        Vous pouvez reprendre un nouveau ticket et vous assurer d'être présent à l'appel.
      </div>

      <Link
        to="/nouveau-ticket"
        className="inline-flex items-center gap-2 bg-white text-red-700 font-bold px-6 py-3 rounded-xl text-sm hover:bg-red-50 transition-colors shadow-sm"
      >
        Reprendre un nouveau ticket
        <IconArrow />
      </Link>
    </div>
  )
}

// ─── CARTE TRAITÉ ────────────────────────────────────────────
function ServedCard({ ticket }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="h-1.5 bg-indigo-500" />
      <div className="p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5 text-indigo-600">
          <IconCheck />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Dossier traité</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-7">
          Votre dossier a été pris en charge avec succès.<br />Merci de votre visite.
        </p>
        <Link
          to={`/feedback/${ticket.id}`}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          Laisser un avis
          <IconArrow />
        </Link>
      </div>
    </div>
  )
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────
export default function TrackingPage() {
  const { ticketNumber } = useParams()
  const navigate = useNavigate()
  const { socket } = useSocket()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const joinedServiceRef = useRef(false)

  const fetchTicket = useCallback(async () => {
    try {
      const res = await api.get(`/api/tickets/${ticketNumber}`)
      setData(res.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Ticket introuvable')
    } finally {
      setLoading(false)
    }
  }, [ticketNumber])

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  useEffect(() => {
    if (!socket || !data || joinedServiceRef.current) return
    const ticket = data.id ? data : data.ticket
    if (!ticket?.serviceId) return
    socket.emit('join-service', { serviceId: ticket.serviceId })
    joinedServiceRef.current = true
  }, [socket, data])

  useEffect(() => {
    if (!socket) return

    socket.emit('join-ticket', { ticketNumber })

    const handleCalled = (ticketData) => {
      if (ticketData.ticketNumber === ticketNumber) {
        toast.success("🔔 C'est votre tour ! Rendez-vous au guichet.", { duration: 8000 })
        fetchTicket()
      }
    }

    const handleQueueUpdated = () => {
      fetchTicket()
    }

    const handleTicketCompleted = (ticketData) => {
      if (ticketData.ticketNumber === ticketNumber) {
        if (ticketData.action === 'served') {
          toast.success('✅ Votre dossier a été traité !', { duration: 3000 })
          setTimeout(() => navigate(`/feedback/${ticketData.id}`), 1500)
        } else if (ticketData.action === 'absent') {
          toast.error('⏰ Vous avez été marqué absent.', { duration: 6000 })
          setData(prev => prev ? { ...prev, status: 'absent' } : prev)
        }
        return
      }
      fetchTicket()
    }

    socket.on('ticket-called', handleCalled)
    socket.on('queue-updated', handleQueueUpdated)
    socket.on('ticket-completed', handleTicketCompleted)

    return () => {
      socket.off('ticket-called', handleCalled)
      socket.off('queue-updated', handleQueueUpdated)
      socket.off('ticket-completed', handleTicketCompleted)
    }
  }, [socket, ticketNumber, fetchTicket])

  // ─── LOADING ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#cbd5e1" }}>
        <Navbar citizenMode />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Chargement de votre ticket...</p>
        </div>
      </div>
    )
  }

  // ─── ERREUR ──────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#cbd5e1" }}>
        <Navbar citizenMode />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Ticket introuvable</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Link
            to="/nouveau-ticket"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Prendre un nouveau ticket
          </Link>
        </div>
      </div>
    )
  }

  const resolvedTicket = data.id ? data : data.ticket
  const resolvedPosition = data.position
  const resolvedTotal = data.total
  const resolvedWait = data.estimatedWait ?? resolvedTicket?.estimatedWait

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#cbd5e1" }}>
      <Navbar citizenMode />

      <div className="max-w-md mx-auto px-4 py-8 space-y-3">

        {/* ── EN-TÊTE TICKET ─────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 px-6 py-5 text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Numéro de ticket
          </div>
          <div className="text-4xl font-black text-indigo-600 mb-3 tracking-tight">
            {resolvedTicket?.ticketNumber}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge variant={resolvedTicket?.status} />
            {resolvedTicket?.priority && <Badge variant="priority" />}
          </div>
        </div>

        {/* ── CARTE PRINCIPALE SELON STATUT ──────────── */}
        {resolvedTicket?.status === 'being_called' && (
          <CalledCard ticket={resolvedTicket} />
        )}

        {resolvedTicket?.status === 'served' && (
          <ServedCard ticket={resolvedTicket} />
        )}

        {resolvedTicket?.status === 'absent' && (
          <AbsentCard />
        )}

        {resolvedTicket?.status === 'waiting' && resolvedPosition && (
          <PositionCard position={resolvedPosition} total={resolvedTotal} />
        )}

        {/* ── INFOS SUPPLÉMENTAIRES (en attente) ─────── */}
        {resolvedTicket?.status === 'waiting' && resolvedWait != null && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-0.5 font-medium">Temps d'attente estimé</div>
                <div className="text-2xl font-bold text-slate-900">~{resolvedWait} min</div>
              </div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-indigo-500"
                   style={{ backgroundColor: '#EDE9FE' }}>
                <IconClock />
              </div>
            </div>
          </div>
        )}

        {/* ── INDICATEUR TEMPS RÉEL ───────────────────── */}
        {resolvedTicket?.status === 'waiting' && (
          <div className="flex items-center justify-center gap-2 py-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">Mise à jour en temps réel</span>
          </div>
        )}

        {/* ── DÉTAILS DU TICKET ───────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Détails du ticket
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { label: 'Nom', value: resolvedTicket?.citizenName },
              { label: 'Service', value: resolvedTicket?.service?.name },
              { label: 'Motif', value: resolvedTicket?.motif },
              { label: 'Créé le', value: resolvedTicket?.createdAt
                ? new Date(resolvedTicket.createdAt).toLocaleString('fr-TN')
                : null },
            ].map(({ label, value }) => value ? (
              <div key={label} className="flex justify-between items-center px-5 py-3">
                <span className="text-xs text-slate-400 font-medium">{label}</span>
                <span className="text-xs text-slate-800 font-semibold text-right max-w-[60%]">{value}</span>
              </div>
            ) : null)}
          </div>
        </div>

      </div>
    </div>
  )
}
