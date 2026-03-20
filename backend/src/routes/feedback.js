// src/routes/feedback.js

const express = require('express')
const router = express.Router()
const feedbackController = require('../controllers/feedbackController')
const { requireAuth, requireAdmin } = require('../middleware/auth')

router.post('/', feedbackController.createFeedback)
router.get('/', requireAuth, requireAdmin, feedbackController.getFeedbacks)

module.exports = router
