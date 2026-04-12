// src/controllers/queueController.js
// File d'attente — vue globale par service

const prisma = require('../lib/prisma')

async function calculerInfosFile(ticket) {
  const ticketsEnAttente = await prisma.ticket.findMany({
    where: {
      serviceId: ticket.serviceId,
      status: 'waiting'
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' },
      { id: 'asc' }
    ],
    select: { id: true }
  })

  const index = ticketsEnAttente.findIndex(t => t.id === ticket.id)

  if (index === -1) {
    return { position: null, estimatedWait: null }
  }

  return {
    position: index + 1,
    estimatedWait: index * ticket.service.avgServiceTime
  }
}

/**
 * GET /api/queue/:serviceId
 * Retourne la file d'attente complète d'un service
 * Ordre : prioritaires d'abord, puis par heure d'arrivée
 */
exports.getQueue = async (req, res) => {
  try {
    const serviceId = parseInt(req.params.serviceId)

    // Vérifier que le service existe
    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) {
      return res.status(404).json({ error: 'Service introuvable' })
    }

    // Tickets en attente + en cours d'appel
    const tickets = await prisma.ticket.findMany({
      where: {
        serviceId,
        status: { in: ['waiting', 'being_called'] }
      },
      orderBy: [
        { priority: 'desc' },  // Prioritaires en premier
        { createdAt: 'asc' }   // Puis ordre d'arrivée
      ],
      include: { service: true, guichet: true }
    })

    // Statistiques rapides de la file
    const stats = {
      total: tickets.length,
      enAttente: tickets.filter(t => t.status === 'waiting').length,
      enAppel: tickets.filter(t => t.status === 'being_called').length,
      avgWaitEstimated: tickets.length * service.avgServiceTime
    }

    res.json({ service, tickets, stats })
  } catch (error) {
    console.error('getQueue error:', error)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}

/**
 * GET /api/queue/position/:ticketNumber
 * Retourne la position d'un ticket dans la file
 */
exports.getPosition = async (req, res) => {
  try {
    const { ticketNumber } = req.params

    const ticket = await prisma.ticket.findUnique({
      where: { ticketNumber: ticketNumber.toUpperCase() },
      include: { service: true }
    })

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket introuvable' })
    }

    if (ticket.status !== 'waiting') {
      return res.json({
        ticket,
        position: null,
        total: null,
        message: `Votre ticket a le statut : ${ticket.status}`
      })
    }

    const fileInfo = await calculerInfosFile(ticket)

    const total = await prisma.ticket.count({
      where: { serviceId: ticket.serviceId, status: 'waiting' }
    })

    res.json({
      ticket,
      position: fileInfo.position,
      total,
      estimatedWait: fileInfo.estimatedWait
    })
  } catch (error) {
    console.error('getPosition error:', error)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}
