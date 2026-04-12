// src/controllers/feedbackController.js
// Gestion des avis citoyens

const prisma = require('../lib/prisma')

/**
 * POST /api/feedback
 * Corps : { ticketId, rating, comment?, waitOk?, agentKind?, resolved? }
 */
exports.createFeedback = async (req, res) => {
  try {
    const { ticketId, rating, comment, waitOk, agentKind, resolved } = req.body

    if (!ticketId || !rating) {
      return res.status(400).json({ error: 'ticketId et rating sont requis' })
    }

    const ratingInt = parseInt(rating)
    if (ratingInt < 1 || ratingInt > 5) {
      return res.status(400).json({ error: 'La note doit être entre 1 et 5' })
    }

    // Vérifier que le ticket existe et est traité
    const ticket = await prisma.ticket.findUnique({ where: { id: parseInt(ticketId) } })
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket introuvable' })
    }

    if (ticket.status !== 'served') {
      return res.status(400).json({ error: 'Le feedback ne peut être laissé que pour un ticket traité' })
    }

    // Vérifier qu'un feedback n'existe pas déjà
    const existant = await prisma.feedback.findUnique({ where: { ticketId: ticket.id } })
    if (existant) {
      return res.status(400).json({ error: 'Un feedback existe déjà pour ce ticket' })
    }

    const feedback = await prisma.feedback.create({
      data: {
        ticketId: ticket.id,
        rating: ratingInt,
        comment: comment?.trim() || null,
        waitOk: waitOk ?? null,
        agentKind: agentKind ?? null,
        resolved: resolved ?? null
      },
      include: { ticket: { include: { service: true } } }
    })

    console.log(`⭐ Feedback reçu: ${ratingInt}/5 pour ticket ${ticket.ticketNumber}`)

    res.status(201).json(feedback)
  } catch (error) {
    console.error('createFeedback error:', error)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}

/**
 * GET /api/feedback
 * Liste tous les feedbacks (admin)
 */
exports.getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ticket: {
          include: { service: true }
        }
      }
    })

    res.json(feedbacks)
  } catch (error) {
    console.error('getFeedbacks error:', error)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}
