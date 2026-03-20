// src/lib/prisma.js
// Instance Prisma partagée dans toute l'application

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
})

module.exports = prisma
