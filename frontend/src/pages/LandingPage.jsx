// src/pages/LandingPage.jsx

import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'

// ─── ICÔNES SVG INLINE ──────────────────────────────────────
function IconClock() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
function IconShield() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
function IconBell() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
function IconArrow() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

// ─── DONNÉES ────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <IconClock />,
    color: 'bg-primary/10 text-primary',
    title: 'Gain de temps',
    desc: 'Prenez votre ticket depuis n\'importe où. Plus besoin de faire la queue physiquement.',
  },
  {
    icon: <IconBell />,
    color: 'bg-accent/10 text-accent',
    title: 'Notifications temps réel',
    desc: 'Soyez alerté quand votre tour approche. Ne ratez jamais votre passage.',
  },
  {
    icon: <IconChart />,
    color: 'bg-success/10 text-success',
    title: 'Suivi en direct',
    desc: 'Visualisez votre position dans la file et le temps d\'attente estimé.',
  },
  {
    icon: <IconShield />,
    color: 'bg-warning/10 text-warning',
    title: 'Simple & sécurisé',
    desc: 'Interface intuitive, aucune application à installer. 100% web.',
  },
]

const STEPS = [
  { num: '01', title: 'Choisissez votre service', desc: 'État Civil, Urbanisme, Finances, Affaires Scolaires...' },
  { num: '02', title: 'Prenez votre ticket', desc: 'Renseignez vos informations et obtenez votre numéro.' },
  { num: '03', title: 'Suivez votre position', desc: 'Suivez l\'avancement de la file en temps réel.' },
  { num: '04', title: 'Présentez-vous', desc: 'Rendez-vous au guichet quand c\'est votre tour.' },
]

const SERVICES = [
  { code: 'EC', name: 'État Civil', color: 'bg-primary/10 text-primary border-primary/20', desc: 'Actes, certificats, légalisations' },
  { code: 'UR', name: 'Urbanisme', color: 'bg-accent/10 text-accent border-accent/20', desc: 'Permis, autorisations' },
  { code: 'FI', name: 'Finances', color: 'bg-success/10 text-success border-success/20', desc: 'Taxes, paiements' },
  { code: 'AS', name: 'Affaires Scolaires', color: 'bg-warning/10 text-warning border-warning/20', desc: 'Inscriptions, bourses' },
]

// ─── PAGE ────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar citizenMode />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        {/* Gradient décoratif */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Système de file d'attente virtuelle
            </div>

            {/* Titre */}
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 leading-tight mb-6"
                style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Fini les longues{' '}
              <span className="text-primary">files d'attente</span>
            </h1>

            <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-xl">
              DigitalQ modernise l'accueil des services municipaux. Prenez votre ticket en ligne, suivez votre position et arrivez au bon moment.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/nouveau-ticket"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-dark transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Prendre un ticket
                <IconArrow />
              </Link>
            </div>

            {/* Stats rapides */}
            <div className="flex flex-wrap gap-8 mt-14 pt-10 border-t border-slate-100">
              {[
                { value: '4', label: 'Services disponibles' },
                { value: '< 2min', label: 'Prise de ticket' },
                { value: '24/7', label: 'Suivi en ligne' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-3xl font-bold text-slate-800" style={{ fontFamily: 'DM Sans, sans-serif' }}>{value}</div>
                  <div className="text-sm text-slate-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────── */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Services disponibles
            </h2>
            <p className="text-slate-500">Choisissez le service dont vous avez besoin</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICES.map(({ code, name, color, desc }) => (
              <Link
                key={code}
                to="/nouveau-ticket"
                className={`bg-white border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-0.5 group ${color}`}
              >
                <div className={`text-2xl font-bold mb-3 ${color.split(' ')[1]}`}
                     style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {code}
                </div>
                <div className="font-semibold text-slate-800 mb-1 group-hover:text-inherit">{name}</div>
                <div className="text-sm text-slate-500">{desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FONCTIONNALITÉS ───────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Pourquoi DigitalQ ?
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Une solution pensée pour faciliter la vie des citoyens et améliorer l'efficacité des services municipaux.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon, color, title, desc }) => (
              <div key={title} className="p-6 rounded-xl border border-slate-100 hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  {icon}
                </div>
                <h3 className="font-semibold text-slate-800 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ─────────────────────────────── */}
      <section className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Comment ça marche ?
            </h2>
            <p className="text-slate-500">4 étapes simples pour gérer votre attente</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ num, title, desc }, i) => (
              <div key={num} className="relative">
                {/* Connecteur */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[60%] w-full h-px bg-slate-200 z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center mx-auto mb-4"
                       style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {num}
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────── */}
      <section className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Prêt à gagner du temps ?
          </h2>
          <p className="text-primary-light mb-8 text-lg">
            Rejoignez les citoyens qui utilisent DigitalQ pour leurs démarches municipales.
          </p>
          <Link
            to="/nouveau-ticket"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all hover:shadow-xl hover:-translate-y-0.5"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Prendre un ticket maintenant
            <IconArrow />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="bg-primary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">Q</span>
            </div>
            <span className="text-white font-semibold" style={{ fontFamily: 'DM Sans, sans-serif' }}>DigitalQ</span>
          </div>
          <p className="text-primary-light text-sm">
            © 2025 DigitalQ — Gestion de files d'attente municipales
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/agent/login" className="text-primary-light hover:text-white transition-colors">Espace Agent</Link>
            <Link to="/admin/login" className="text-primary-light hover:text-white transition-colors">Administration</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
