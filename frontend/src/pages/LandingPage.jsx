// src/pages/LandingPage.jsx

import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'

// ─── ICÔNES SERVICES ────────────────────────────────────────
function IconEtatCivil() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <circle cx="8.5" cy="10.5" r="2.5" />
      <path d="M4 20c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
      <line x1="14" y1="9" x2="20" y2="9" />
      <line x1="14" y1="13" x2="18" y2="13" />
    </svg>
  )
}
function IconUrbanisme() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <rect x="9" y="14" width="6" height="7" />
      <rect x="7" y="10" width="3" height="3" />
      <rect x="14" y="10" width="3" height="3" />
    </svg>
  )
}
function IconFinances() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  )
}
function IconScolaire() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 3L2 8l10 5 10-5-10-5z" />
      <path d="M2 8v6c0 2 4.5 4 10 4s10-2 10-4V8" />
    </svg>
  )
}
function IconArrow() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}
function IconClock() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
function IconBell() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
function IconShield() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

// ─── DONNÉES ────────────────────────────────────────────────
const SERVICES = [
  {
    code: 'EC', name: 'État Civil', desc: 'Actes de naissance, certificats de résidence, légalisations et documents officiels.',
    icon: <IconEtatCivil />, color: 'bg-indigo-50 text-indigo-600', border: 'hover:border-indigo-300',
  },
  {
    code: 'UR', name: 'Urbanisme', desc: 'Permis de construire, autorisations de travaux et certificats de conformité.',
    icon: <IconUrbanisme />, color: 'bg-violet-50 text-violet-600', border: 'hover:border-violet-300',
  },
  {
    code: 'FI', name: 'Finances', desc: 'Paiement des taxes, amendes municipales et attestations fiscales.',
    icon: <IconFinances />, color: 'bg-purple-50 text-purple-600', border: 'hover:border-purple-300',
  },
  {
    code: 'AS', name: 'Affaires Scolaires', desc: 'Inscriptions scolaires, bourses d\'études et attestations de scolarité.',
    icon: <IconScolaire />, color: 'bg-fuchsia-50 text-fuchsia-600', border: 'hover:border-fuchsia-300',
  },
]

const FEATURES = [
  { icon: <IconClock />, title: 'Gain de temps', desc: "Prenez votre ticket depuis n'importe où. Plus besoin d'attendre sur place.", color: 'bg-indigo-50 text-indigo-600' },
  { icon: <IconBell />, title: 'Alertes en temps réel', desc: "Soyez notifié quand votre tour approche. Ne manquez jamais votre passage.", color: 'bg-violet-50 text-violet-600' },
  { icon: <IconChart />, title: 'Suivi en direct', desc: "Visualisez votre position dans la file et l'attente estimée à tout moment.", color: 'bg-purple-50 text-purple-600' },
  { icon: <IconShield />, title: 'Simple et fiable', desc: "Aucune application à installer. Interface 100% web, disponible 24h/24.", color: 'bg-fuchsia-50 text-fuchsia-600' },
]

const STEPS = [
  { num: '01', title: 'Choisissez votre service', desc: 'État Civil, Urbanisme, Finances ou Affaires Scolaires.' },
  { num: '02', title: 'Remplissez le formulaire', desc: 'Nom, téléphone et motif de votre visite en moins de 2 minutes.' },
  { num: '03', title: 'Suivez votre position', desc: 'Consultez votre avancement dans la file en temps réel.' },
  { num: '04', title: 'Présentez-vous au guichet', desc: "Arrivez au bon moment — vous êtes alerté quand c'est votre tour." },
]

const STATS = [
  { value: '4', label: 'Services disponibles' },
  { value: '< 2 min', label: 'Prise de ticket' },
  { value: '24/7', label: 'Suivi en ligne' },
]

// ─── PAGE ────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#cbd5e1" }}>
      <Navbar citizenMode />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="border-b" style={{ backgroundColor: '#F3E8FF', borderColor: '#E9D5FF' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            File d'attente virtuelle — Services municipaux
          </span>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4 max-w-3xl mx-auto">
            Gérez votre attente en municipalité{' '}
            <span className="text-indigo-600">sans vous déplacer</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-8 max-w-xl mx-auto">
            DigitalQ modernise l'accueil des services municipaux tunisiens. Prenez votre ticket en ligne et arrivez au bon moment.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              to="/nouveau-ticket"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
              Prendre un ticket gratuitement
              <IconArrow />
            </Link>
            <Link
              to="/agent/login"
              className="text-sm text-slate-500 hover:text-indigo-600 px-4 py-3 transition-colors"
            >
              Espace agent →
            </Link>
          </div>

          {/* Stats */}
          <div className="inline-flex items-center divide-x divide-slate-200 bg-white border border-slate-200 rounded-xl px-6 py-4 shadow-sm">
            {STATS.map(({ value, label }) => (
              <div key={label} className="px-6 first:pl-0 last:pr-0 text-center">
                <div className="text-xl font-bold text-indigo-600">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Nos services</h2>
            <p className="text-sm text-slate-500">Sélectionnez le guichet dont vous avez besoin</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICES.map(({ code, name, desc, icon, color, border }) => (
              <Link
                key={code}
                to="/nouveau-ticket"
                className={`group bg-white border border-slate-200 ${border} rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
              >
                <div className={`w-11 h-11 rounded-lg ${color} flex items-center justify-center mb-4`}>
                  {icon}
                </div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">{code}</div>
                <h3 className="font-semibold text-slate-800 text-sm mb-2">{name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{desc}</p>
                <span className="text-xs font-medium text-indigo-600 group-hover:underline">
                  Prendre un ticket →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FONCTIONNALITÉS ───────────────────────────────────── */}
      <section className="py-14 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Pourquoi DigitalQ ?</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Une plateforme pensée pour simplifier vos démarches administratives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon, title, desc, color }) => (
              <div key={title} className="text-center">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-4`}>
                  {icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ─────────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Comment ça marche ?</h2>
            <p className="text-sm text-slate-500">4 étapes simples, en moins de 2 minutes</p>
          </div>

          <div className="relative">
            {/* Ligne de connexion (desktop) */}
            <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-indigo-100" aria-hidden="true" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {STEPS.map(({ num, title, desc }) => (
                <div key={num} className="relative text-center">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4 relative z-10">
                    {num}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section className="py-14 bg-indigo-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Prêt à gagner du temps ?
          </h2>
          <p className="text-indigo-100 text-sm mb-7 leading-relaxed">
            Rejoignez les citoyens qui utilisent DigitalQ pour leurs démarches municipales.<br />
            Gratuit, rapide et disponible depuis n'importe quel appareil.
          </p>
          <Link
            to="/nouveau-ticket"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg text-sm hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Prendre un ticket maintenant
            <IconArrow />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="9" fill="#4f46e5" />
              <rect x="8" y="10" width="16" height="2.5" rx="1.25" fill="white" />
              <rect x="8" y="15" width="10" height="2.5" rx="1.25" fill="white" />
              <rect x="8" y="20" width="13" height="2.5" rx="1.25" fill="white" />
              <circle cx="23" cy="21.25" r="2.5" fill="#a5b4fc" />
            </svg>
            <span className="text-white font-semibold text-sm tracking-tight">
              Digital<span className="text-indigo-400 font-bold">Q</span>
            </span>
          </div>
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} DigitalQ — Gestion de files d'attente municipales
          </p>
          <div className="flex gap-5 text-xs">
            <Link to="/agent/login" className="text-slate-500 hover:text-white transition-colors">Espace Agent</Link>
            <Link to="/admin/login" className="text-slate-500 hover:text-white transition-colors">Administration</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
