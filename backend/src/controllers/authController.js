// src/controllers/authController.js
// Authentification JWT pour agents et admins

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h'

/**
 * POST /api/auth/login
 * Corps : { username, password }
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username et password requis' })
    }

    // Chercher l'utilisateur avec son guichet si agent
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        guichet: {
          include: { service: true }
        }
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects' })
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Compte désactivé' })
    }

    // Vérifier le mot de passe
    const passwordOk = await bcrypt.compare(password, user.password)
    if (!passwordOk) {
      return res.status(401).json({ error: 'Identifiants incorrects' })
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    // Ne pas renvoyer le hash du mot de passe
    const { password: _pwd, ...userSafe } = user

    console.log(`✅ Login: ${user.username} (${user.role})`)

    res.json({
      token,
      user: userSafe
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}

/**
 * GET /api/auth/me
 * Header : Authorization: Bearer <token>
 */
exports.getMe = async (req, res) => {
  try {
    const { password: _pwd, ...userSafe } = req.user
    res.json(userSafe)
  } catch (error) {
    console.error('GetMe error:', error)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}

/**
 * POST /api/auth/logout
 * (Stateless JWT — côté client il suffit de supprimer le token)
 */
exports.logout = (req, res) => {
  res.json({ message: 'Déconnecté avec succès' })
}
