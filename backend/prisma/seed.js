// prisma/seed.js
// Données initiales pour DigitalQ

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seed...')

  // ─── SERVICES ──────────────────────────────────────────────
  const etatCivil = await prisma.service.create({
    data: { name: 'État Civil', code: 'EC', avgServiceTime: 7 }
  })

  const urbanisme = await prisma.service.create({
    data: { name: 'Urbanisme', code: 'UR', avgServiceTime: 10 }
  })

  const finances = await prisma.service.create({
    data: { name: 'Finances', code: 'FI', avgServiceTime: 5 }
  })

  const affairesScolaires = await prisma.service.create({
    data: { name: 'Affaires Scolaires', code: 'AS', avgServiceTime: 8 }
  })

  console.log('✅ Services créés')

  // ─── GUICHETS ───────────────────────────────────────────────
  const guichet_EC1 = await prisma.guichet.create({ data: { number: 1, serviceId: etatCivil.id, status: 'active' } })
  const guichet_EC2 = await prisma.guichet.create({ data: { number: 2, serviceId: etatCivil.id, status: 'active' } })
  const guichet_UR1 = await prisma.guichet.create({ data: { number: 1, serviceId: urbanisme.id, status: 'active' } })
  const guichet_FI1 = await prisma.guichet.create({ data: { number: 1, serviceId: finances.id, status: 'active' } })
  const guichet_AS1 = await prisma.guichet.create({ data: { number: 1, serviceId: affairesScolaires.id, status: 'active' } })

  console.log('✅ Guichets créés')

  // ─── USERS ──────────────────────────────────────────────────
  // Chaque agent a son propre mot de passe
  const hash = async (pwd) => bcrypt.hash(pwd, 10)

  await prisma.user.createMany({
    data: [
      {
        username: 'fatma.mansour',
        password: await hash('Fatma@2026'),
        firstName: 'Fatma',
        lastName: 'Mansour',
        email: 'fatma@digitalq.tn',
        role: 'agent',
        assignedGuichet: guichet_EC1.id
      },
      {
        username: 'karim.belhadj',
        password: await hash('Karim@2026'),
        firstName: 'Karim',
        lastName: 'Belhadj',
        email: 'karim@digitalq.tn',
        role: 'agent',
        assignedGuichet: guichet_EC2.id
      },
      {
        username: 'sami.belhaj',
        password: await hash('Sami@2026'),
        firstName: 'Sami',
        lastName: 'Belhaj',
        email: 'sami@digitalq.tn',
        role: 'agent',
        assignedGuichet: guichet_UR1.id
      },
      {
        username: 'rania.ouali',
        password: await hash('Rania@2026'),
        firstName: 'Rania',
        lastName: 'Ouali',
        email: 'rania@digitalq.tn',
        role: 'agent',
        assignedGuichet: guichet_FI1.id
      },
      {
        username: 'nadia.chabbi',
        password: await hash('Nadia@2026'),
        firstName: 'Nadia',
        lastName: 'Chabbi',
        email: 'nadia@digitalq.tn',
        role: 'agent',
        assignedGuichet: guichet_AS1.id
      },
      {
        username: 'admin',
        password: await hash('Admin@2026'),
        firstName: 'Admin',
        lastName: 'DigitalQ',
        email: 'admin@digitalq.tn',
        role: 'admin'
      }
    ]
  })

  console.log('✅ Utilisateurs créés')
  console.log('   → fatma.mansour / Fatma@2026  (État Civil - Guichet 1)')
  console.log('   → karim.belhadj / Karim@2026  (État Civil - Guichet 2)')
  console.log('   → sami.belhaj   / Sami@2026   (Urbanisme - Guichet 1)')
  console.log('   → rania.ouali   / Rania@2026  (Finances - Guichet 1)')
  console.log('   → nadia.chabbi  / Nadia@2026  (Affaires Scolaires - Guichet 1)')
  console.log('   → admin         / Admin@2026  (Administrateur)')

  // ─── TICKETS DE TEST ────────────────────────────────────────
  await prisma.ticket.createMany({
    data: [
      {
        ticketNumber: 'EC-001',
        citizenName: 'Ahmed Ben Ali',
        citizenPhone: '+216 12 345 678',
        serviceId: etatCivil.id,
        motif: 'Acte de naissance',
        status: 'waiting',
        priority: false
      },
      {
        ticketNumber: 'EC-002',
        citizenName: 'Leila Mansour',
        citizenPhone: '+216 23 456 789',
        serviceId: etatCivil.id,
        motif: 'Légalisation',
        status: 'waiting',
        priority: true
      },
      {
        ticketNumber: 'EC-003',
        citizenName: 'Mohamed Trabelsi',
        citizenPhone: '+216 34 567 890',
        serviceId: etatCivil.id,
        motif: 'Certificat mariage',
        status: 'waiting',
        priority: false
      },
      {
        ticketNumber: 'UR-001',
        citizenName: 'Sonia Khelil',
        citizenPhone: '+216 45 678 901',
        serviceId: urbanisme.id,
        motif: 'Permis de construire',
        status: 'waiting',
        priority: false
      },
      {
        ticketNumber: 'FI-001',
        citizenName: 'Nour Ben Salah',
        citizenPhone: '+216 56 789 012',
        serviceId: finances.id,
        motif: 'Paiement taxe',
        status: 'waiting',
        priority: false
      }
    ]
  })

  console.log('✅ Tickets de test créés')
  console.log('\n🎉 Seed terminé avec succès !')
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
