// src/routes/tickets.js

const express = require('express')
const router = express.Router()
const ticketController = require('../controllers/ticketController')
const { requireAuth } = require('../middleware/auth')

// Routes publiques (citoyens)
router.post('/', ticketController.createTicket)
router.get('/:identifier', ticketController.getTicket)
router.delete('/:id', ticketController.cancelTicket)

// Routes protégées (agents authentifiés)
router.patch('/call-next', requireAuth, ticketController.callNext)
router.patch('/:id/serve', requireAuth, ticketController.serveTicket)
router.patch('/:id/absent', requireAuth, ticketController.markAbsent)

module.exports = router
