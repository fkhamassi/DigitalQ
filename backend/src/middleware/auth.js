// src/middleware/auth.js
// Middleware JWT — protège les routes agent/admin

const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

const JWT_SECRET = process.env.JWT_SECRET

/**
 * Vérifie le token JWT et attache l'utilisateur à req.user
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant ou invalide' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)

    // Vérifier que l'utilisateur existe toujours et est actif
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { guichet: { include: { service: true } } }
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Utilisateur inactif ou introuvable' })
    }

    // Attacher l'utilisateur complet à la requête
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' })
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalide' })
    }
    console.error('Auth middleware error:', error)
    res.status(500).json({ error: 'Erreur interne' })
  }
}

/**
 * Vérifie que l'utilisateur est admin
 * Doit être utilisé APRÈS requireAuth
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' })
  }
  next()
}

module.exports = { requireAuth, requireAdmin }
