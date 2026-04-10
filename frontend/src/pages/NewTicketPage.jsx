// src/pages/NewTicketPage.jsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/common/Navbar'
import api from '../api/axios'

// ─── ICÔNES ──────────────────────────────────────────────────
function IconCheck() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconEtatCivil({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <circle cx="8.5" cy="10.5" r="2.5" />
      <path d="M4 20c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
      <line x1="14" y1="9" x2="20" y2="9" />
      <line x1="14" y1="13" x2="18" y2="13" />
    </svg>
  )
}

function IconUrbanisme({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <rect x="9" y="14" width="6" height="7" />
      <rect x="7" y="10" width="3" height="3" />
      <rect x="14" y="10" width="3" height="3" />
    </svg>
  )
}

function IconFinances({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  )
}

function IconAffairesScolaires({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 3L2 8l10 5 10-5-10-5z" />
      <path d="M2 8v6c0 2 4.5 4 10 4s10-2 10-4V8" />
      <line x1="22" y1="8" x2="22" y2="14" />
    </svg>
  )
}

const SERVICE_CONFIG = {
  EC: {
    Icon: IconEtatCivil,
    desc: 'Actes, certificats, légalisations',
  },
  UR: {
    Icon: IconUrbanisme,
    desc: 'Permis de construire, autorisations',
  },
  FI: {
    Icon: IconFinances,
    desc: 'Taxes, paiements, amendes',
  },
  AS: {
    Icon: IconAffairesScolaires,
    desc: 'Inscriptions, bourses scolaires',
  },
}

// ─── COMPOSANT SÉLECTEUR DE SERVICE ──────────────────────────
function ServiceCard({ service, selected, onClick }) {
  const config = SERVICE_CONFIG[service.code] || {
    Icon: IconEtatCivil,
    desc: '',
  }
  const { Icon, desc } = config

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 rounded-lg border text-left transition-colors ${
        selected
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${selected ? 'text-indigo-600' : 'text-slate-400'}`} />
        <span className={`text-xs font-bold tracking-widest uppercase ${selected ? 'text-indigo-600' : 'text-slate-400'}`}>
          {service.code}
        </span>
      </div>
      <div className={`font-medium text-sm mb-0.5 ${selected ? 'text-slate-900' : 'text-slate-700'}`}>
        {service.name}
      </div>
      <div className="text-xs text-slate-400 mb-2">{desc}</div>
      <div className="text-xs text-slate-500">~{service.avgServiceTime} min / personne</div>
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
    <div className="min-h-screen" style={{ backgroundColor: "#cbd5e1" }}>
      <Navbar citizenMode />

      <div className="max-w-xl mx-auto px-4 py-8">

        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">Nouveau ticket</h1>
          <p className="text-sm text-slate-500">
            Remplissez le formulaire pour prendre votre place dans la file.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── SÉLECTION SERVICE ──────────────────────── */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-sm font-medium text-slate-700 mb-3">
              1. Choisissez votre service
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 gap-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
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
              <p className="text-red-600 text-xs mt-2">{errors.serviceId}</p>
            )}
          </div>

          {/* ── INFORMATIONS PERSONNELLES ──────────────── */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-sm font-medium text-slate-700 mb-3">
              2. Vos informations
            </h2>

            <div className="space-y-3">
              {/* Nom */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.citizenName}
                  onChange={e => setField('citizenName', e.target.value)}
                  placeholder="Mohamed Ben Ahmed"
                  className={`w-full px-3 py-2 rounded-md border text-sm outline-none transition-colors ${
                    errors.citizenName
                      ? 'border-red-400 bg-red-50'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200'
                  }`}
                />
                {errors.citizenName && (
                  <p className="text-red-600 text-xs mt-1">{errors.citizenName}</p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Numéro de téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.citizenPhone}
                  onChange={e => setField('citizenPhone', e.target.value)}
                  placeholder="+216 XX XXX XXX"
                  className={`w-full px-3 py-2 rounded-md border text-sm outline-none transition-colors ${
                    errors.citizenPhone
                      ? 'border-red-400 bg-red-50'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200'
                  }`}
                />
                {errors.citizenPhone && (
                  <p className="text-red-600 text-xs mt-1">{errors.citizenPhone}</p>
                )}
              </div>

              {/* Motif */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Motif de la visite <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.motif}
                  onChange={e => setField('motif', e.target.value)}
                  placeholder="Ex: Acte de naissance, Permis de construire..."
                  className={`w-full px-3 py-2 rounded-md border text-sm outline-none transition-colors ${
                    errors.motif
                      ? 'border-red-400 bg-red-50'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200'
                  }`}
                />
                {errors.motif && (
                  <p className="text-red-600 text-xs mt-1">{errors.motif}</p>
                )}
              </div>

              {/* Priorité */}
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  id="priority"
                  checked={form.priority}
                  onChange={e => setField('priority', e.target.checked)}
                  className="w-4 h-4 accent-amber-600 cursor-pointer"
                />
                <span className="text-sm text-slate-700">
                  <span className="font-medium">Cas prioritaire</span>
                  <span className="text-slate-500 text-xs ml-1">
                    (personne âgée, handicapée, femme enceinte...)
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* ── BOUTON SUBMIT ──────────────────────────── */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-md font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
