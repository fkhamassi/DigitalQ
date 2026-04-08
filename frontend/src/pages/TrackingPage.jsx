// src/pages/TrackingPage.jsx
// Suivi temps réel du ticket citoyen via Socket.io

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/common/Navbar'
import Badge from '../components/common/Badge'
import { useSocket } from '../context/SocketContext'
import api from '../api/axios'

// ─── CARTE POSITION ──────────────────────────────────────────
function PositionCard({ position, total }) {
  return (
    <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-10 rounded-2xl text-center"
         style={{ boxShadow: 'var(--shadow-xl)' }}>
      <div className="text-sm uppercase tracking-widest opacity-75 mb-3 font-medium">
        Votre position
      </div>
      <div className="flex items-end justify-center gap-1 mb-2">
        <span className="text-8xl font-bold leading-none" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          {position}
        </span>
        <span className="text-3xl font-medium opacity-75 mb-2">
          {position === 1 ? 'er' : 'ème'}
        </span>
      </div>
      <div className="text-primary-light text-lg">
        sur {total} personne{total > 1 ? 's' : ''} en attente
      </div>
    </div>
  )
}

// ─── BARRE DE PROGRESSION ────────────────────────────────────
function ProgressBar({ position, total }) {
  if (!position || !total || total === 0) return null
  const pct = Math.max(0, Math.min(100, ((total - position) / total) * 100))

  return (
    <div>
      <div className="flex justify-between text-sm text-slate-500 mb-2">
        <span>Progression</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── ÉTAT APPELÉ ─────────────────────────────────────────────
function CalledCard({ ticket }) {
  return (
    <div className="bg-gradient-to-br from-success to-emerald-600 text-white p-10 rounded-2xl text-center animate-pulse"
         style={{ boxShadow: 'var(--shadow-xl)' }}>
      <div className="text-6xl mb-4">🔔</div>
      <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        C'est votre tour !
      </div>
      <div className="text-emerald-100 text-lg mb-4">
        Rendez-vous au guichet {ticket.guichet?.number}
      </div>
      <div className="bg-white/20 rounded-xl p-4 text-sm">
        Présentez-vous rapidement, sinon vous serez marqué absent.
      </div>
    </div>
  )
}

// ─── ÉTAT TRAITÉ ─────────────────────────────────────────────
function ServedCard({ ticket }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center"
         style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        Ticket traité
      </h2>
      <p className="text-slate-500 mb-6">
        Votre dossier a été traité. Merci de votre visite.
      </p>
      {/* Lien feedback */}
      <Link
        to={`/feedback/${ticket.id}`}
        className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors"
      >
        Laisser un avis
      </Link>
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

  // Rejoindre la room du service UNE SEULE FOIS une fois le ticket chargé
  useEffect(() => {
    if (!socket || !data || joinedServiceRef.current) return
    const ticket = data.id ? data : data.ticket
    if (!ticket?.serviceId) return
    socket.emit('join-service', { serviceId: ticket.serviceId })
    joinedServiceRef.current = true
  }, [socket, data])

  // Intégration Socket.io
  useEffect(() => {
    if (!socket) return

    socket.emit('join-ticket', { ticketNumber })

    // Notre ticket est appelé → recharger pour avoir guichet + nouveau statut
    const handleCalled = (ticketData) => {
      if (ticketData.ticketNumber === ticketNumber) {
        toast.success("🔔 C'est votre tour ! Rendez-vous au guichet.", { duration: 8000 })
        fetchTicket()
      }
    }

    // Un ticket du même service avance → décrémenter position localement (instantané)
    const handleQueueUpdated = () => {
      setData(prev => {
        if (!prev) return prev
        const currentPos = prev.position
        const currentTotal = prev.total
        if (!currentPos || !currentTotal) return prev
        const newPos = Math.max(1, currentPos - 1)
        const newTotal = Math.max(0, currentTotal - 1)
        return { ...prev, position: newPos, total: newTotal }
      })
    }

    // Ticket traité ou absent
    const handleTicketCompleted = (ticketData) => {
      // C'est notre ticket
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
      // Sinon → décrémenter la position dans la file
      setData(prev => {
        if (!prev) return prev
        const currentPos = prev.position
        const currentTotal = prev.total
        if (!currentPos || !currentTotal) return prev
        const newPos = Math.max(1, currentPos - 1)
        const newTotal = Math.max(0, currentTotal - 1)
        return { ...prev, position: newPos, total: newTotal }
      })
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

  // ─── LOADING ────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar citizenMode />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Chargement de votre ticket...</p>
        </div>
      </div>
    )
  }

  // ─── ERREUR ─────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar citizenMode />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Ticket introuvable
          </h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link to="/nouveau-ticket"
                className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors">
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
    <div className="min-h-screen bg-surface">
      <Navbar citizenMode />

      <div className="max-w-md mx-auto px-4 py-10">

        {/* En-tête ticket */}
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-primary mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {resolvedTicket?.ticketNumber}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge variant={resolvedTicket?.status} />
            {resolvedTicket?.priority && <Badge variant="priority" />}
          </div>
        </div>

        {/* Carte principale selon statut */}
        {resolvedTicket?.status === 'being_called' && (
          <CalledCard ticket={resolvedTicket} />
        )}

        {resolvedTicket?.status === 'served' && (
          <ServedCard ticket={resolvedTicket} />
        )}

        {resolvedTicket?.status === 'absent' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-3">⏰</div>
            <h2 className="text-xl font-bold text-red-700 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Marqué absent
            </h2>
            <p className="text-red-600 text-sm mb-4">
              Vous étiez absent lors de l'appel de votre ticket.
            </p>
            <Link to="/nouveau-ticket"
                  className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors">
              Reprendre un ticket
            </Link>
          </div>
        )}

        {resolvedTicket?.status === 'waiting' && resolvedPosition && (
          <PositionCard position={resolvedPosition} total={resolvedTotal} />
        )}

        {/* Informations supplémentaires (si en attente) */}
        {resolvedTicket?.status === 'waiting' && (
          <div className="mt-6 space-y-4">

            {/* Temps estimé */}
            {resolvedWait != null && (
              <div className="bg-white rounded-xl border border-slate-200 p-5"
                   style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Temps d'attente estimé</div>
                    <div className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      ~{resolvedWait} min
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Barre de progression */}
            {resolvedPosition && resolvedTotal && (
              <div className="bg-white rounded-xl border border-slate-200 p-5"
                   style={{ boxShadow: 'var(--shadow-sm)' }}>
                <ProgressBar position={resolvedPosition} total={resolvedTotal} />
              </div>
            )}

            {/* Indicateur temps réel */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              Mise à jour en temps réel
            </div>
          </div>
        )}

        {/* Informations du ticket */}
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5"
             style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">
            Détails
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Nom', value: resolvedTicket?.citizenName },
              { label: 'Service', value: resolvedTicket?.service?.name },
              { label: 'Motif', value: resolvedTicket?.motif },
              { label: 'Créé le', value: resolvedTicket?.createdAt
                ? new Date(resolvedTicket.createdAt).toLocaleString('fr-TN')
                : null },
            ].map(({ label, value }) => value ? (
              <div key={label} className="flex justify-between items-start">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm text-slate-800 font-medium text-right max-w-[60%]">{value}</span>
              </div>
            ) : null)}
          </div>
        </div>

      </div>
    </div>
  )
}
