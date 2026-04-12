// src/components/common/Badge.jsx

const VARIANTS = {
  waiting:      'bg-amber-50 text-amber-700 border-amber-200',
  being_called: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  served:       'bg-green-50 text-green-700 border-green-200',
  absent:       'bg-red-50 text-red-700 border-red-200',
  priority:     'bg-orange-50 text-orange-700 border-orange-200',
  active:       'bg-green-50 text-green-700 border-green-200',
  inactive:     'bg-slate-50 text-slate-600 border-slate-200',
  pause:        'bg-amber-50 text-amber-700 border-amber-200',
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
  const colorClass = VARIANTS[variant] || 'bg-slate-50 text-slate-600 border-slate-200'
  const displayLabel = label ?? LABELS[variant] ?? variant

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${colorClass} ${className}`}>
      {displayLabel}
    </span>
  )
}
