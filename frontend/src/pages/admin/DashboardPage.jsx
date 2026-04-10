// src/pages/admin/DashboardPage.jsx
// Dashboard administrateur : KPIs, stats par service, feedbacks

import { useState, useEffect } from 'react'
import Navbar from '../../components/common/Navbar'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

// ─── CARTE KPI ───────────────────────────────────────────────
function KPICard({ label, value, sub, icon, color }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
          {icon}
        </div>
      </div>
    </Card>
  )
}

// ─── BARRE HORIZONTALE ───────────────────────────────────────
function HBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-700 font-medium">{label}</span>
        <span className="text-slate-500">{value}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── DISTRIBUTION HORAIRE ────────────────────────────────────
function HourlyChart({ data }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="flex items-end gap-1 h-20">
      {data.filter((_, i) => i >= 7 && i <= 19).map(({ heure, count }) => (
        <div key={heure} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-indigo-100 hover:bg-indigo-300 rounded-t transition-colors"
            style={{ height: `${Math.max(3, (count / max) * 64)}px` }}
            title={`${heure}: ${count} tickets`}
          />
          <span className="text-xs text-slate-400 leading-none">{heure.replace('h', '')}</span>
        </div>
      ))}
    </div>
  )
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────
export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [statsRes, feedbacksRes] = await Promise.all([
          api.get('/api/stats/today'),
          api.get('/api/feedback'),
        ])
        setStats(statsRes.data)
        setFeedbacks(feedbacksRes.data.slice(0, 10))
      } catch (err) {
        console.error('Admin dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#cbd5e1" }}>
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  const maxServiceTotal = Math.max(...(stats?.parService?.map(s => s.total) || [1]), 1)

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#cbd5e1" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Tableau de bord</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {new Date().toLocaleDateString('fr-TN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
          <span className="text-xs font-medium px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
            {user?.firstName} {user?.lastName}
          </span>
        </div>

        {/* ── KPI CARDS ───────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <KPICard
            label="Tickets aujourd'hui"
            value={stats?.totalTickets}
            sub="Depuis l'ouverture"
            color="text-indigo-600"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
            }
          />
          <KPICard
            label="Traités"
            value={stats?.totalTraites}
            sub={`${stats?.tauxTraitement ?? 0}% de taux de service`}
            color="text-emerald-600"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
          />
          <KPICard
            label="Temps moyen"
            value={stats?.avgWaitTime ? `${stats.avgWaitTime} min` : '—'}
            sub="Durée de traitement"
            color="text-slate-800"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
          <KPICard
            label="Satisfaction"
            value={stats?.avgSatisfaction ? `${stats.avgSatisfaction}/5` : '—'}
            sub={`${feedbacks.length} avis reçus`}
            color="text-amber-600"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* ── BREAKDOWN PAR SERVICE ─────────────────── */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-sm font-medium text-slate-800 mb-4">Tickets par service</h2>
              <div className="space-y-4">
                {stats?.parService?.map(({ service, total, traites, enAttente }) => (
                  <div key={service.id}>
                    <HBar
                      label={service.name}
                      value={total}
                      max={maxServiceTotal}
                      color="bg-indigo-500"
                    />
                    <div className="flex gap-4 mt-1">
                      <span className="text-xs text-emerald-600">{traites} traités</span>
                      <span className="text-xs text-amber-600">{enAttente} en attente</span>
                    </div>
                  </div>
                )) ?? (
                  <p className="text-slate-400 text-xs text-center py-4">Aucune donnée</p>
                )}
              </div>
            </Card>
          </div>

          {/* ── RÉSUMÉ + HEURE DE POINTE ─────────────── */}
          <div className="space-y-3">
            <Card>
              <h2 className="text-sm font-medium text-slate-800 mb-3">Résumé du jour</h2>
              <div className="space-y-2">
                {[
                  { label: 'En attente', value: stats?.totalEnAttente, color: 'text-amber-600' },
                  { label: 'En appel', value: stats?.totalEnAppel, color: 'text-indigo-600' },
                  { label: 'Absents', value: stats?.totalAbsents, color: 'text-red-600' },
                  { label: 'Traités', value: stats?.totalTraites, color: 'text-emerald-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className={`text-sm font-semibold ${color}`}>{value ?? 0}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">Total</span>
                  <span className="text-sm font-bold text-slate-900">{stats?.totalTickets ?? 0}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-medium text-slate-800 mb-1">Heure de pointe</h3>
              <div className="text-2xl font-bold text-indigo-600 my-1">
                {stats?.distributionHoraire
                  ? stats.distributionHoraire.reduce(
                      (max, d) => d.count > max.count ? d : max,
                      { count: 0, heure: '—' }
                    ).heure
                  : '—'
                }
              </div>
              <p className="text-xs text-slate-400">Pic d'affluence</p>
            </Card>
          </div>
        </div>

        {/* ── DISTRIBUTION HORAIRE ─────────────────────── */}
        {stats?.distributionHoraire && (
          <Card className="mb-4">
            <h2 className="text-sm font-medium text-slate-800 mb-4">Distribution horaire (7h – 19h)</h2>
            <HourlyChart data={stats.distributionHoraire} />
          </Card>
        )}

        {/* ── DERNIERS FEEDBACKS ────────────────────────── */}
        <Card>
          <h2 className="text-sm font-medium text-slate-800 mb-4">Derniers avis citoyens</h2>

          {feedbacks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">Aucun avis reçu</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="flex items-start gap-3 py-3">
                  {/* Étoiles */}
                  <div className="flex gap-0.5 flex-shrink-0 mt-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= fb.rating ? 'text-amber-400' : 'text-slate-200'}`}
                        fill="currentColor" viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-slate-800">
                        {fb.ticket?.citizenName}
                      </span>
                      <Badge
                        variant={fb.ticket?.service?.code === 'EC' ? 'being_called' : 'waiting'}
                        label={fb.ticket?.service?.name}
                      />
                    </div>
                    {fb.comment && (
                      <p className="text-xs text-slate-500 truncate">{fb.comment}</p>
                    )}
                    <div className="flex gap-3 mt-0.5">
                      {fb.waitOk !== null && (
                        <span className={`text-xs ${fb.waitOk ? 'text-emerald-600' : 'text-red-600'}`}>
                          {fb.waitOk ? '✓ Attente OK' : '✗ Attente longue'}
                        </span>
                      )}
                      {fb.resolved !== null && (
                        <span className={`text-xs ${fb.resolved ? 'text-emerald-600' : 'text-red-600'}`}>
                          {fb.resolved ? '✓ Résolu' : '✗ Non résolu'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex-shrink-0">
                    {new Date(fb.createdAt).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </div>
  )
}
