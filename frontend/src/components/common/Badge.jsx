// src/components/common/Badge.jsx

const VARIANTS = {
  waiting:      'bg-amber-100 text-amber-700',
  being_called: 'bg-primary/10 text-primary',
  served:       'bg-emerald-100 text-emerald-700',
  absent:       'bg-red-100 text-red-600',
  priority:     'bg-orange-100 text-orange-600',
  active:       'bg-emerald-100 text-emerald-700',
  inactive:     'bg-slate-100 text-slate-500',
  pause:        'bg-amber-100 text-amber-600',
}

const LABELS = {
  waiting:      'En attente',
  being_called: 'Appelé',
  served:       'Traité',
  absent:       'Absent',
  priority:     'Prioritaire',
  active:       'Actif',
  inactive:     'Inactif',
  pause:        'Pause',
}

export default function Badge({ variant = 'waiting', label, className = '' }) {
  const colorClass = VARIANTS[variant] || 'bg-slate-100 text-slate-600'
  const displayLabel = label ?? LABELS[variant] ?? variant

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {displayLabel}
    </span>
  )
}
