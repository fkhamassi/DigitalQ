// src/components/common/Card.jsx

export default function Card({ children, className = '', padding = true }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  )
}
