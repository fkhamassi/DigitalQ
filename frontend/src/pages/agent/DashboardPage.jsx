// src/pages/agent/DashboardPage.jsx
// Dashboard agent : file d'attente + appel suivant + statut tickets

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../../components/common/Navbar'
import Badge from '../../components/common/Badge'
import Card from '../../components/common/Card'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import api from '../../api/axios'

// ─── TICKET EN COURS ─────────────────────────────────────────
function CurrentTicketPanel({ ticket, onServe, onAbsent, loading }) {
  if (!ticket) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎫</div>
          <p className="text-slate-500 text-sm">Aucun ticket en cours</p>
          <p className="text-slate-400 text-xs mt-1">Appelez le suivant pour commencer</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Ticket en cours</div>
          <div className="text-3xl font-bold text-primary" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {ticket.ticketNumber}
          </div>
        </div>
        <Badge variant="being_called" />
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex gap-2 text-sm">
          <span className="text-slate-500 w-20">Nom :</span>
          <span className="font-medium text-slate-800">{ticket.citizenName}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-slate-500 w-20">Téléphone :</span>
          <span className="font-medium text-slate-800">{ticket.citizenPhone}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-slate-500 w-20">Motif :</span>
          <span className="font-medium text-slate-800">{ticket.motif}</span>
        </div>
        {ticket.priority && (
          <div className="flex gap-2 text-sm items-center">
            <span className="text-slate-500 w-20">Priorité :</span>
            <Badge variant="priority" />
          </div>
        )}
        {ticket.calledAt && (
          <div className="flex gap-2 text-sm">
            <span className="text-slate-500 w-20">Appelé à :</span>
            <span className="font-medium text-slate-800">
              {new Date(ticket.calledAt).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onServe(ticket.id)}
          disabled={loading}
          className="flex-1 bg-success text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-all disabled:opacity-60"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          ✅ Traité
        </button>
        <button
          onClick={() => onAbsent(ticket.id)}
          disabled={loading}
          className="flex-1 bg-danger text-white py-3 rounded-xl font-semibold text-sm hover:bg-red-600 transition-all disabled:opacity-60"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          ⚠️ Absent
        </button>
      </div>
    </Card>
  )
}

// ─── LIGNE TICKET FILE ───────────────────────────────────────
function TicketRow({ ticket, index }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
      ticket.status === 'being_called'
        ? 'bg-primary/5 border-primary/30'
        : 'bg-white border-slate-100 hover:border-slate-200'
    }`}>
      {/* Position */}
      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm font-bold flex items-center justify-center flex-shrink-0">
        {index + 1}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {ticket.ticketNumber}
          </span>
          {ticket.priority && <Badge variant="priority" />}
          <Badge variant={ticket.status} />
        </div>
        <div className="text-sm text-slate-500 truncate mt-0.5">
          {ticket.citizenName} — {ticket.motif}
        </div>
      </div>

      {/* Heure */}
      <div className="text-xs text-slate-400 flex-shrink-0">
        {new Date(ticket.createdAt).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  )
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────
export default function AgentDashboardPage() {
  const { user } = useAuth()
  const { socket } = useSocket()

  const [queue, setQueue] = useState([])
  const [currentTicket, setCurrentTicket] = useState(null)
  const [stats, setStats] = useState({ total: 0, enAttente: 0, enAppel: 0 })
  const [loading, setLoading] = useState(false)
  const [calling, setCalling] = useState(false)

  const serviceId = user?.guichet?.serviceId

  // Charger la file d'attente
  const fetchQueue = useCallback(async () => {
    if (!serviceId) return
    try {
      const res = await api.get(`/api/queue/${serviceId}`)
      const { tickets, stats: qStats } = res.data
      setQueue(tickets)
      setStats(qStats)
      // Trouver le ticket en cours de l'agent
      const enCours = tickets.find(t =>
        t.status === 'being_called' && t.guichetId === user?.assignedGuichet
      )
      setCurrentTicket(enCours || null)
    } catch (err) {
      console.error('fetchQueue error:', err)
    }
  }, [serviceId, user?.assignedGuichet])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  // Socket.io : mise à jour temps réel
  useEffect(() => {
    if (!socket || !serviceId) return

    socket.emit('join-service', { serviceId })

    const refresh = () => fetchQueue()
    socket.on('new-ticket', refresh)
    socket.on('queue-updated', refresh)
    socket.on('ticket-completed', refresh)

    return () => {
      socket.off('new-ticket', refresh)
      socket.off('queue-updated', refresh)
      socket.off('ticket-completed', refresh)
    }
  }, [socket, serviceId, fetchQueue])

  // Appeler le ticket suivant
  const handleCallNext = async () => {
    if (currentTicket) {
      toast.error('Terminez le ticket en cours avant d\'en appeler un nouveau')
      return
    }
    setCalling(true)
    try {
      const res = await api.patch('/api/tickets/call-next')
      toast.success(`Ticket ${res.data.ticketNumber} appelé !`)
      await fetchQueue()
    } catch (err) {
      const msg = err.response?.data?.error || 'Aucun ticket en attente'
      toast.error(msg)
    } finally {
      setCalling(false)
    }
  }

  // Marquer traité
  const handleServe = async (ticketId) => {
    setLoading(true)
    try {
      await api.patch(`/api/tickets/${ticketId}/serve`)
      toast.success('Ticket marqué traité ✅')
      setCurrentTicket(null)
      await fetchQueue()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  // Marquer absent
  const handleAbsent = async (ticketId) => {
    setLoading(true)
    try {
      await api.patch(`/api/tickets/${ticketId}/absent`)
      toast.error('Citoyen marqué absent ⚠️')
      setCurrentTicket(null)
      await fetchQueue()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const ticketsEnAttente = queue.filter(t => t.status === 'waiting')

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Dashboard Agent
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {user?.firstName} {user?.lastName} —{' '}
              <span className="text-primary font-medium">
                {user?.guichet?.service?.name} · Guichet {user?.guichet?.number}
              </span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">
              {new Date().toLocaleDateString('fr-TN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'En attente', value: stats.enAttente, color: 'text-warning' },
            { label: 'En appel', value: stats.enAppel, color: 'text-primary' },
            { label: 'Total file', value: stats.total, color: 'text-slate-700' },
          ].map(({ label, value, color }) => (
            <Card key={label} className="text-center">
              <div className={`text-3xl font-bold mb-1 ${color}`}
                   style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {value}
              </div>
              <div className="text-xs text-slate-500">{label}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Colonne gauche : ticket en cours + bouton appel */}
          <div className="space-y-4">
            {/* Bouton appel */}
            <button
              onClick={handleCallNext}
              disabled={calling || !!currentTicket}
              className={`w-full py-5 rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-3 ${
                currentTicket
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
              }`}
              style={{ fontFamily: 'DM Sans, sans-serif', boxShadow: currentTicket ? 'none' : 'var(--shadow-lg)' }}
            >
              {calling ? (
                <>
                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Appel...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
                    <path d="M17 3l4 4-8 8H9v-4l8-8z" />
                  </svg>
                  Appeler suivant
                </>
              )}
            </button>

            {/* Ticket en cours */}
            <CurrentTicketPanel
              ticket={currentTicket}
              onServe={handleServe}
              onAbsent={handleAbsent}
              loading={loading}
            />
          </div>

          {/* Colonne droite : file d'attente */}
          <div className="lg:col-span-2">
            <Card padding={false}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  File d'attente — {user?.guichet?.service?.name}
                </h2>
                <span className="text-sm text-slate-500">
                  {ticketsEnAttente.length} en attente
                </span>
              </div>

              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                {queue.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">✨</div>
                    <p className="text-slate-500 text-sm">La file est vide</p>
                  </div>
                ) : (
                  queue.map((ticket, index) => (
                    <TicketRow key={ticket.id} ticket={ticket} index={index} />
                  ))
                )}
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
