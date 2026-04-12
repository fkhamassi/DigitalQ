// src/controllers/statsController.js
// Statistiques pour le dashboard admin

const prisma = require('../lib/prisma')

/**
 * GET /api/stats/today
 * Stats globales du jour (admin)
 */
exports.getStatsToday = async (req, res) => {
  try {
    const debutJour = new Date()
    debutJour.setHours(0, 0, 0, 0)
    const finJour = new Date()
    finJour.setHours(23, 59, 59, 999)

    // Tickets du jour
    const ticketsAujourdhui = await prisma.ticket.findMany({
      where: { createdAt: { gte: debutJour, lte: finJour } },
      include: { service: true }
    })

    const totalTickets = ticketsAujourdhui.length
    const totalTraites = ticketsAujourdhui.filter(t => t.status === 'served').length
    const totalAbsents = ticketsAujourdhui.filter(t => t.status === 'absent').length
    const totalEnAttente = ticketsAujourdhui.filter(t => t.status === 'waiting').length
    const totalEnAppel = ticketsAujourdhui.filter(t => t.status === 'being_called').length

    // Temps d'attente moyen (tickets traités uniquement)
    const ticketsTraites = ticketsAujourdhui.filter(t => t.actualWait !== null)
    const avgWaitTime = ticketsTraites.length > 0
      ? ticketsTraites.reduce((sum, t) => sum + t.actualWait, 0) / ticketsTraites.length
      : null

    // Satisfaction moyenne (si feedbacks)
    const feedbacks = await prisma.feedback.findMany({
      where: { createdAt: { gte: debutJour, lte: finJour } }
    })
    const avgSatisfaction = feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : null

    // Breakdown par service
    const services = await prisma.service.findMany({ where: { isActive: true } })
    const parService = await Promise.all(services.map(async (service) => {
      const ticketsService = ticketsAujourdhui.filter(t => t.serviceId === service.id)
      return {
        service,
        total: ticketsService.length,
        traites: ticketsService.filter(t => t.status === 'served').length,
        enAttente: ticketsService.filter(t => t.status === 'waiting').length
      }
    }))

    // Heure de pointe (heure avec le plus de tickets)
    const parHeure = Array(24).fill(0)
    ticketsAujourdhui.forEach(t => {
      const heure = new Date(t.createdAt).getHours()
      parHeure[heure]++
    })
    const heurePointe = parHeure.indexOf(Math.max(...parHeure))

    res.json({
      date: debutJour,
      totalTickets,
      totalTraites,
      totalAbsents,
      totalEnAttente,
      totalEnAppel,
      avgWaitTime: avgWaitTime ? Math.round(avgWaitTime) : null,
      avgSatisfaction: avgSatisfaction ? Math.round(avgSatisfaction * 10) / 10 : null,
      tauxTraitement: totalTickets > 0 ? Math.round((totalTraites / totalTickets) * 100) : 0,
      parService,
      distributionHoraire: parHeure.map((count, heure) => ({ heure: `${heure}h`, count }))
    })
  } catch (error) {
    console.error('getStatsToday error:', error)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}

/**
 * GET /api/stats/service/:id
 * Stats d'un service spécifique
 */
exports.getStatsService = async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id)

    const debutJour = new Date()
    debutJour.setHours(0, 0, 0, 0)

    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) {
      return res.status(404).json({ error: 'Service introuvable' })
    }

    const tickets = await prisma.ticket.findMany({
      where: { serviceId, createdAt: { gte: debutJour } }
    })

    const enAttente = await prisma.ticket.count({
      where: { serviceId, status: 'waiting' }
    })

    res.json({
      service,
      totalJour: tickets.length,
      enAttente,
      traites: tickets.filter(t => t.status === 'served').length,
      absents: tickets.filter(t => t.status === 'absent').length
    })
  } catch (error) {
    console.error('getStatsService error:', error)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}
