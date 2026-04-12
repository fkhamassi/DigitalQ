// src/server.js
// Point d'entrée — crée le serveur HTTP + Socket.io

require('dotenv').config()

const http = require('http')
const { Server } = require('socket.io')
const app = require('./app')

const PORT = process.env.PORT || 3000

// ─── SERVEUR HTTP ────────────────────────────────────────────
const server = http.createServer(app)

// ─── SOCKET.IO ───────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Injecter io dans app pour pouvoir y accéder via req.io
app.set('io', io)

// ─── ÉVÉNEMENTS SOCKET.IO ───────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Client connecté : ${socket.id}`)

  // Citoyen rejoint la room de son ticket
  socket.on('join-ticket', ({ ticketNumber }) => {
    socket.join(`ticket:${ticketNumber}`)
    console.log(`🎫 Socket ${socket.id} rejoint room ticket:${ticketNumber}`)
  })

  // Agent rejoint la room de son service
  socket.on('join-service', ({ serviceId }) => {
    socket.join(`service:${serviceId}`)
    console.log(`🏢 Socket ${socket.id} rejoint room service:${serviceId}`)
  })

  socket.on('disconnect', () => {
    console.log(`❌ Client déconnecté : ${socket.id}`)
  })
})

// ─── DÉMARRAGE ───────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🚀 DigitalQ Backend lancé sur http://localhost:${PORT}`)
  console.log(`📡 Socket.io actif`)
  console.log(`🌍 Env: ${process.env.NODE_ENV || 'development'}\n`)
})
