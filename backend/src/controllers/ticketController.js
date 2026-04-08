// src/controllers/ticketController.js
// CRUD tickets + logique métier (appel, service, absent)

const prisma = require('../lib/prisma')

// ─── CONSTANTES ──────────────────────────────────────────────
const STATUTS = {
  WAITING: 'waiting',
  BEING_CALLED: 'being_called',
  SERVED: 'served',
  ABSENT: 'absent'
}

/**
 * Génère le prochain numéro de ticket pour un service
 * Format : EC-001, EC-002, UR-001, etc.
 */
async function genererNumeroTicket(serviceId) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } })

  // Trouver le dernier ticket de ce service pour garantir un numéro unique
  const dernierTicket = await prisma.ticket.findFirst({
    where: { serviceId },
    orderBy: { id: 'desc' }
  })

  let prochain = 1
  if (dernierTicket) {
    const dernierNum = parseInt(dernierTicket.ticketNumber.split('-')[1])
    prochain = dernierNum + 1
  }

  return `${service.code}-${String(prochain).padStart(3, '0')}`
}

/**
 * Calcule le temps d'attente estimé en minutes
 */
async function calculerTempsAttente(serviceId) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } })

  const nbEnAttente = await prisma.ticket.count({
    where: { serviceId, status: STATUTS.WAITING }
  })

  return nbEnAttente * service.avgServiceTime
}

// ─────────────────────────────────────────────────────────────

/**
 * POST /api/tickets
 * Crée un nouveau ticket (citoyen)
 */
exports.createTicket = async (req, res) => {
  try {
    const { citizenName, citizenPhone, serviceId, motif, priority } = req.body

    // Validation
    if (!citizenName || !citizenPhone || !serviceId || !motif) {
      return res.status(400).json({ error: 'Champs requis : citizenName, citizenPhone, serviceId, motif' })
    }

    const serviceIdInt = parseInt(serviceId)

    // Vérifier que le service existe et est actif
    const service = await prisma.service.findUnique({ where: { id: serviceIdInt } })
    if (!service || !service.isActive) {
      return res.status(404).json({ error: 'Service introuvable ou inactif' })
    }

    // Générer le numéro de ticket
    const ticketNumber = await genererNumeroTicket(serviceIdInt)

    // Calculer le temps d'attente estimé
    const estimatedWait = await calculerTempsAttente(serviceIdInt)

    // Créer le ticket
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        citizenName: citizenName.trim(),
        citizenPhone: citizenPhone.trim(),
        serviceId: serviceIdInt,
        motif: motif.trim(),
        priority: priority === true || priority === 'true',
        status: STATUTS.WAITING,
        estimatedWait,
        guichetId: null // Pas d'assignation à la création
      },
      include: { service: true }
    })

    // SMS simulé (console uniquement)
    console.log(`📱 SMS simulé → ${citizenPhone}: Votre ticket ${ticketNumber} est confirmé. Temps d'attente estimé: ${estimatedWait} min.`)

    // Notifier tous les agents du service en temps réel
    req.io.to(`service:${serviceIdInt}`).emit('new-ticket', ticket)

    console.log(`🎫 Nouveau ticket créé: ${ticketNumber} pour ${citizenName}`)

    res.status(201).json(ticket)
  } catch (error) {
    console.error('createTicket error:', error)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}

/**
 * GET /api/tickets/:identifier
 * Récupère un ticket par son numéro (EC-001) ou son ID
 */
exports.getTicket = async (req, res) => {
  try {
    const { identifier } = req.params

    // Détecter si c'est un numéro (contient '-') ou un ID numérique
    const isNumber = isNaN(identifier)

    const ticket = await prisma.ticket.findFirst({
      where: isNumber
        ? { ticketNumber: identifier.toUpperCase() }
        : { id: parseInt(identifier) },
      include: {
        service: true,
        guichet: true,
        feedback: true
      }
    })

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket introuvable' })
    }

    // Calculer la position dans la file
    let position = null
    if (ticket.status === STATUTS.WAITING) {
      position = await prisma.ticket.count({
        where: {
          serviceId: ticket.serviceId,
          status: STATUTS.WAITING,
          OR: [
            // Les tickets prioritaires passent devant
            { priority: true, createdAt: { lt: ticket.createdAt } },
            { priority: ticket.priority, createdAt: { lte: ticket.createdAt } }
          ]
        }
      })
    }

    const total = await prisma.ticket.count({
      where: { serviceId: ticket.serviceId, status: STATUTS.WAITING }
    })

    res.json({ ...ticket, position, total })
  } catch (error) {
    console.error('getTicket error:', error)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}

/**
 * PATCH /api/tickets/call-next
 * Appelle le prochain ticket en attente (agent authentifié)
 * Utilise une transaction pour éviter les doubles appels
 */
exports.callNext = async (req, res) => {
  try {
    const agent = req.user

    if (!agent.assignedGuichet) {
      return res.status(400).json({ error: 'Agent sans guichet assigné' })
    }

    // Récupérer le guichet de l'agent avec son service
    const guichet = await prisma.guichet.findUnique({
      where: { id: agent.assignedGuichet },
      include: { service: true }
    })

    if (!guichet) {
      return res.status(404).json({ error: 'Guichet introuvable' })
    }

    // Transaction : récupérer + mettre à jour atomiquement
    const ticket = await prisma.$transaction(async (tx) => {
      // Prioritaires d'abord, puis ordre d'arrivée
      const prochain = await tx.ticket.findFirst({
        where: {
          serviceId: guichet.serviceId,
          status: STATUTS.WAITING
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ]
      })

      if (!prochain) return null

      // Mettre à jour le ticket
      return tx.ticket.update({
        where: { id: prochain.id },
        data: {
          status: STATUTS.BEING_CALLED,
          calledAt: new Date(),
          guichetId: guichet.id
        },
        include: { service: true, guichet: true }
      })
    })

    if (!ticket) {
      return res.status(404).json({ error: 'Aucun ticket en attente pour ce service' })
    }

    // Notifier le citoyen concerné
    req.io.to(`ticket:${ticket.ticketNumber}`).emit('ticket-called', {
      ...ticket,
      guichetNumber: guichet.number,
      message: `C'est votre tour ! Rendez-vous au guichet ${guichet.number}`
    })

    // Notifier tous les agents que la file a changé
    req.io.to(`service:${guichet.serviceId}`).emit('queue-updated', { action: 'called', ticket })

    console.log(`📢 Ticket appelé: ${ticket.ticketNumber} → Guichet ${guichet.number} (Agent: ${agent.username})`)

    res.json(ticket)
  } catch (error) {
    console.error('callNext error:', error)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}

/**
 * PATCH /api/tickets/:id/serve
 * Marque le ticket comme traité (agent authentifié)
 */
exports.serveTicket = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id)

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket introuvable' })
    }

    if (ticket.status !== STATUTS.BEING_CALLED) {
      return res.status(400).json({ error: `Impossible de traiter un ticket avec statut "${ticket.status}"` })
    }

    // Calculer le temps de traitement réel
    const actualWait = ticket.calledAt
      ? Math.round((new Date() - new Date(ticket.createdAt)) / 60000)
      : null

    const ticketMaj = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: STATUTS.SERVED,
        servedAt: new Date(),
        actualWait
      },
      include: { service: true, guichet: true }
    })

    // Notifier la file
    req.io.to(`service:${ticket.serviceId}`).emit('ticket-completed', {
      ...ticketMaj,
      action: 'served'
    })

    console.log(`✅ Ticket traité: ${ticketMaj.ticketNumber} (${actualWait} min)`)

    res.json(ticketMaj)
  } catch (error) {
    console.error('serveTicket error:', error)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}

/**
 * PATCH /api/tickets/:id/absent
 * Marque le citoyen comme absent (agent authentifié)
 */
exports.markAbsent = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id)

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket introuvable' })
    }

    if (ticket.status !== STATUTS.BEING_CALLED) {
      return res.status(400).json({ error: `Impossible de marquer absent un ticket avec statut "${ticket.status}"` })
    }

    const ticketMaj = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: STATUTS.ABSENT },
      include: { service: true, guichet: true }
    })

    // Notifier la file
    req.io.to(`service:${ticket.serviceId}`).emit('ticket-completed', {
      ...ticketMaj,
      action: 'absent'
    })

    console.log(`⚠️  Ticket absent: ${ticketMaj.ticketNumber}`)

    res.json(ticketMaj)
  } catch (error) {
    console.error('markAbsent error:', error)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}

/**
 * DELETE /api/tickets/:id
 * Annule un ticket (citoyen)
 */
exports.cancelTicket = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id)

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket introuvable' })
    }

    if (ticket.status !== STATUTS.WAITING) {
      return res.status(400).json({ error: 'Seuls les tickets en attente peuvent être annulés' })
    }

    await prisma.ticket.delete({ where: { id: ticketId } })

    // Notifier la file
    req.io.to(`service:${ticket.serviceId}`).emit('queue-updated', {
      action: 'cancelled',
      ticketId
    })

    console.log(`🗑️  Ticket annulé: ${ticket.ticketNumber}`)

    res.json({ message: 'Ticket annulé avec succès' })
  } catch (error) {
    console.error('cancelTicket error:', error)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}
