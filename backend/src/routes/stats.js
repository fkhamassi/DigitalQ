// src/routes/stats.js

const express = require('express')
const router = express.Router()
const statsController = require('../controllers/statsController')
const { requireAuth, requireAdmin } = require('../middleware/auth')

router.get('/today', requireAuth, requireAdmin, statsController.getStatsToday)
router.get('/service/:id', requireAuth, statsController.getStatsService)

module.exports = router
