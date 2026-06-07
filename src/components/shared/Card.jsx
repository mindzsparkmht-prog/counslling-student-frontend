export function Card({ children, className = '', onClick, padding = 'p-4' }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm ${padding} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
