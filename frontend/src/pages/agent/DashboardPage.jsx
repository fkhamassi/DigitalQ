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
        <div className="text-center py-6">
          <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm text-slate-500">Aucun ticket en cours</p>
          <p className="text-xs text-slate-400 mt-0.5">Appelez le suivant pour commencer</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-l-4 border-l-indigo-500">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Ticket en cours</div>
          <div className="text-2xl font-bold text-indigo-600">{ticket.ticketNumber}</div>
        </div>
        <Badge variant="being_called" />
      </div>

      <div className="space-y-1.5 mb-4 text-sm">
        <div className="flex gap-2">
          <span className="text-slate-400 w-20 flex-shrink-0">Nom</span>
          <span className="font-medium text-slate-800">{ticket.citizenName}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-400 w-20 flex-shrink-0">Téléphone</span>
          <span className="font-medium text-slate-800">{ticket.citizenPhone}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-400 w-20 flex-shrink-0">Motif</span>
          <span className="font-medium text-slate-800">{ticket.motif}</span>
        </div>
        {ticket.priority && (
          <div className="flex gap-2 items-center">
            <span className="text-slate-400 w-20 flex-shrink-0">Priorité</span>
            <Badge variant="priority" />
          </div>
        )}
        {ticket.calledAt && (
          <div className="flex gap-2">
            <span className="text-slate-400 w-20 flex-shrink-0">Appelé à</span>
            <span className="font-medium text-slate-800">
              {new Date(ticket.calledAt).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onServe(ticket.id)}
          disabled={loading}
          className="flex-1 bg-emerald-600 text-white py-2 rounded-md font-medium text-sm hover:bg-emerald-700 transition-colors disabled:opacity-60"
        >
          Traité
        </button>
        <button
          onClick={() => onAbsent(ticket.id)}
          disabled={loading}
          className="flex-1 bg-red-600 text-white py-2 rounded-md font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-60"
        >
          Absent
        </button>
      </div>
    </Card>
  )
}

// ─── LIGNE TICKET FILE ───────────────────────────────────────
function TicketRow({ ticket, index }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0 ${
      ticket.status === 'being_called' ? 'bg-indigo-50' : index % 2 === 1 ? 'bg-slate-50' : 'bg-white'
    }`}>
      <div className="w-6 h-6 rounded bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm text-slate-900">{ticket.ticketNumber}</span>
          {ticket.priority && <Badge variant="priority" />}
          <Badge variant={ticket.status} />
        </div>
        <div className="text-xs text-slate-500 truncate">
          {ticket.citizenName} — {ticket.motif}
        </div>
      </div>

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

  const fetchQueue = useCallback(async () => {
    if (!serviceId) return
    try {
      const res = await api.get(`/api/queue/${serviceId}`)
      const { tickets, stats: qStats } = res.data
      setQueue(tickets)
      setStats(qStats)
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

  const handleCallNext = async () => {
    if (currentTicket) {
      toast.error("Terminez le ticket en cours avant d'en appeler un nouveau")
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

  const handleServe = async (ticketId) => {
    setLoading(true)
    try {
      await api.patch(`/api/tickets/${ticketId}/serve`)
      toast.success('Ticket marqué traité')
      setCurrentTicket(null)
      await fetchQueue()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const handleAbsent = async (ticketId) => {
    setLoading(true)
    try {
      await api.patch(`/api/tickets/${ticketId}/absent`)
      toast.error('Citoyen marqué absent')
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
    <div className="min-h-screen" style={{ backgroundColor: "#cbd5e1" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Dashboard Agent</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {user?.firstName} {user?.lastName} —{' '}
              <span className="text-indigo-600 font-medium">
                {user?.guichet?.service?.name} · Guichet {user?.guichet?.number}
              </span>
            </p>
          </div>
          <div className="text-xs text-slate-400">
            {new Date().toLocaleDateString('fr-TN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'En attente', value: stats.enAttente, color: 'text-amber-600' },
            { label: 'En appel', value: stats.enAppel, color: 'text-indigo-600' },
            { label: 'Total file', value: stats.total, color: 'text-slate-700' },
          ].map(({ label, value, color }) => (
            <Card key={label} className="text-center py-3">
              <div className={`text-2xl font-bold mb-0.5 ${color}`}>{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Colonne gauche */}
          <div className="space-y-3">
            {/* Bouton appel */}
            <button
              onClick={handleCallNext}
              disabled={calling || !!currentTicket}
              className={`w-full py-3 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                currentTicket
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {calling ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Appel...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
                    <path d="M17 3l4 4-8 8H9v-4l8-8z" />
                  </svg>
                  Appeler le suivant
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
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-medium text-slate-800">
                  File d'attente — {user?.guichet?.service?.name}
                </h2>
                <span className="text-xs text-slate-500">
                  {ticketsEnAttente.length} en attente
                </span>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {queue.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-slate-400">La file est vide</p>
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
