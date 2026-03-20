// src/app.js
// Configuration Express + middlewares

const express = require('express')
const cors = require('cors')

// Routes
const ticketRoutes = require('./routes/tickets')
const queueRoutes = require('./routes/queue')
const authRoutes = require('./routes/auth')
const statsRoutes = require('./routes/stats')
const feedbackRoutes = require('./routes/feedback')

const app = express()

// ─── MIDDLEWARES GLOBAUX ─────────────────────────────────────
app.use(cors({
  // En dev : autoriser tous les ports localhost (5173, 5174, etc.)
  // En prod : utiliser FRONTEND_URL
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : /^http:\/\/localhost(:\d+)?$/,
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Middleware pour injecter l'instance Socket.io dans req
// (sera attaché dans server.js après création du serveur)
app.use((req, res, next) => {
  req.io = app.get('io')
  next()
})

// ─── ROUTES ─────────────────────────────────────────────────
app.use('/api/tickets', ticketRoutes)
app.use('/api/queue', queueRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/feedback', feedbackRoutes)

// ─── ROUTE DE SANTÉ ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DigitalQ API en marche 🚀' })
})

// ─── GESTION ERREURS 404 ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} introuvable` })
})

// ─── GESTION ERREURS GLOBALES ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Erreur globale:', err.stack)
  res.status(500).json({ error: 'Erreur interne du serveur' })
})

module.exports = app
