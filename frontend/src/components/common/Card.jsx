// src/components/common/Card.jsx

export default function Card({ children, className = '', padding = true }) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl ${padding ? 'p-6' : ''} ${className}`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {children}
    </div>
  )
}
