// src/pages/NewTicketPage.jsx
// Formulaire de prise de ticket pour le citoyen

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/common/Navbar'
import api from '../api/axios'

// ─── ICÔNES ──────────────────────────────────────────────────
function IconCheck() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// Icône État Civil : carte d'identité / document officiel
function IconEtatCivil({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <circle cx="8.5" cy="10.5" r="2.5" />
      <path d="M4 20c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
      <line x1="14" y1="9" x2="20" y2="9" />
      <line x1="14" y1="13" x2="18" y2="13" />
    </svg>
  )
}

// Icône Urbanisme : bâtiment / plan
function IconUrbanisme({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <rect x="9" y="14" width="6" height="7" />
      <rect x="7" y="10" width="3" height="3" />
      <rect x="14" y="10" width="3" height="3" />
    </svg>
  )
}

// Icône Finances : pièce / billet
function IconFinances({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  )
}

// Icône Affaires Scolaires : chapeau de diplômé / livre
function IconAffairesScolaires({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 3L2 8l10 5 10-5-10-5z" />
      <path d="M2 8v6c0 2 4.5 4 10 4s10-2 10-4V8" />
      <line x1="22" y1="8" x2="22" y2="14" />
    </svg>
  )
}

// Mapping code → icône + config couleur
const SERVICE_CONFIG = {
  EC: {
    Icon: IconEtatCivil,
    border: 'border-primary',
    bg: 'bg-primary/8',
    iconBg: 'bg-primary/10',
    text: 'text-primary',
    desc: 'Actes, certificats, légalisations',
  },
  UR: {
    Icon: IconUrbanisme,
    border: 'border-accent',
    bg: 'bg-accent/8',
    iconBg: 'bg-accent/10',
    text: 'text-accent',
    desc: 'Permis de construire, autorisations',
  },
  FI: {
    Icon: IconFinances,
    border: 'border-success',
    bg: 'bg-success/8',
    iconBg: 'bg-success/10',
    text: 'text-success',
    desc: 'Taxes, paiements, amendes',
  },
  AS: {
    Icon: IconAffairesScolaires,
    border: 'border-warning',
    bg: 'bg-warning/8',
    iconBg: 'bg-warning/10',
    text: 'text-warning',
    desc: 'Inscriptions, bourses scolaires',
  },
}

// ─── COMPOSANT SÉLECTEUR DE SERVICE ──────────────────────────
function ServiceCard({ service, selected, onClick }) {
  const config = SERVICE_CONFIG[service.code] || {
    Icon: IconEtatCivil,
    border: 'border-slate-200',
    bg: 'bg-surface',
    iconBg: 'bg-slate-100',
    text: 'text-slate-600',
    desc: '',
  }
  const { Icon, border, bg, iconBg, text, desc } = config

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-5 rounded-xl border-2 text-left transition-all hover:shadow-md group ${
        selected
          ? `${border} ${bg}`
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      {/* Icône + code */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          selected ? iconBg : 'bg-slate-100 group-hover:bg-slate-200'
        }`}>
          <Icon className={`w-6 h-6 ${selected ? text : 'text-slate-500'}`} />
        </div>
        <span className={`text-xs font-bold tracking-widest uppercase ${
          selected ? text : 'text-slate-400'
        }`}>
          {service.code}
        </span>
      </div>

      {/* Nom du service */}
      <div className={`font-semibold text-sm mb-1 ${selected ? 'text-slate-800' : 'text-slate-700'}`}
           style={{ fontFamily: 'DM Sans, sans-serif' }}>
        {service.name}
      </div>

      {/* Description */}
      <div className="text-xs text-slate-400 leading-relaxed mb-2">
        {desc}
      </div>

      {/* Temps moyen */}
      <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        selected ? `${iconBg} ${text}` : 'bg-slate-100 text-slate-500'
      }`}>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        ~{service.avgServiceTime} min / personne
      </div>
    </button>
  )
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────
export default function NewTicketPage() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    citizenName: '',
    citizenPhone: '',
    serviceId: '',
    motif: '',
    priority: false,
  })
  const [errors, setErrors] = useState({})

  // Charger les services (routes publiques uniquement)
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)
      try {
        const r1 = await api.get('/api/queue/1')
        const r2 = await api.get('/api/queue/2')
        const r3 = await api.get('/api/queue/3')
        const r4 = await api.get('/api/queue/4')
        setServices([r1.data.service, r2.data.service, r3.data.service, r4.data.service].filter(Boolean))
      } catch {
        // Services par défaut si l'API échoue
        setServices([
          { id: 1, name: 'État Civil', code: 'EC', avgServiceTime: 7 },
          { id: 2, name: 'Urbanisme', code: 'UR', avgServiceTime: 10 },
          { id: 3, name: 'Finances', code: 'FI', avgServiceTime: 5 },
          { id: 4, name: 'Affaires Scolaires', code: 'AS', avgServiceTime: 8 },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const validate = () => {
    const newErrors = {}
    if (!form.citizenName.trim()) newErrors.citizenName = 'Le nom est requis'
    if (!form.citizenPhone.trim()) newErrors.citizenPhone = 'Le téléphone est requis'
    if (!form.serviceId) newErrors.serviceId = 'Choisissez un service'
    if (!form.motif.trim()) newErrors.motif = 'Le motif est requis'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const res = await api.post('/api/tickets', {
        ...form,
        serviceId: parseInt(form.serviceId),
      })
      toast.success('Ticket créé avec succès !')
      navigate(`/suivi/${res.data.ticketNumber}`)
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur lors de la création du ticket'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar citizenMode />

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Prendre un ticket
          </h1>
          <p className="text-slate-500">
            Remplissez le formulaire pour obtenir votre numéro dans la file d'attente.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── SÉLECTION SERVICE ──────────────────────── */}
          <div className="bg-white rounded-xl border border-slate-200 p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="font-semibold text-slate-800 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              1. Choisissez votre service
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {services.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    selected={form.serviceId === String(service.id)}
                    onClick={() => setField('serviceId', String(service.id))}
                  />
                ))}
              </div>
            )}

            {errors.serviceId && (
              <p className="text-danger text-sm mt-2">{errors.serviceId}</p>
            )}
          </div>

          {/* ── INFORMATIONS PERSONNELLES ──────────────── */}
          <div className="bg-white rounded-xl border border-slate-200 p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="font-semibold text-slate-800 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              2. Vos informations
            </h2>

            <div className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nom complet <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={form.citizenName}
                  onChange={e => setField('citizenName', e.target.value)}
                  placeholder="Ex: Mohamed Ben Ahmed"
                  className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all
                    ${errors.citizenName
                      ? 'border-danger bg-red-50 focus:ring-2 focus:ring-danger/20'
                      : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
                />
                {errors.citizenName && (
                  <p className="text-danger text-xs mt-1">{errors.citizenName}</p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Numéro de téléphone <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  value={form.citizenPhone}
                  onChange={e => setField('citizenPhone', e.target.value)}
                  placeholder="+216 XX XXX XXX"
                  className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all
                    ${errors.citizenPhone
                      ? 'border-danger bg-red-50 focus:ring-2 focus:ring-danger/20'
                      : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
                />
                {errors.citizenPhone && (
                  <p className="text-danger text-xs mt-1">{errors.citizenPhone}</p>
                )}
              </div>

              {/* Motif */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Motif de la visite <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={form.motif}
                  onChange={e => setField('motif', e.target.value)}
                  placeholder="Ex: Acte de naissance, Permis de construire..."
                  className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all
                    ${errors.motif
                      ? 'border-danger bg-red-50 focus:ring-2 focus:ring-danger/20'
                      : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
                />
                {errors.motif && (
                  <p className="text-danger text-xs mt-1">{errors.motif}</p>
                )}
              </div>

              {/* Priorité */}
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
                <input
                  type="checkbox"
                  id="priority"
                  checked={form.priority}
                  onChange={e => setField('priority', e.target.checked)}
                  className="w-4 h-4 accent-warning cursor-pointer"
                />
                <label htmlFor="priority" className="text-sm text-slate-700 cursor-pointer">
                  <span className="font-medium">Cas prioritaire</span>
                  <span className="text-slate-500 ml-1">(personne âgée, handicapée, femme enceinte...)</span>
                </label>
              </div>
            </div>
          </div>

          {/* ── BOUTON SUBMIT ──────────────────────────── */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-dark transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            {submitting ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Création en cours...
              </>
            ) : (
              <>
                <IconCheck />
                Confirmer et obtenir mon ticket
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  )
}
