// src/routes/queue.js

const express = require('express')
const router = express.Router()
const queueController = require('../controllers/queueController')

// IMPORTANT : route /position/:ticketNumber doit être avant /:serviceId
// pour éviter que "position" soit interprété comme un serviceId
router.get('/position/:ticketNumber', queueController.getPosition)
router.get('/:serviceId', queueController.getQueue)

module.exports = router
