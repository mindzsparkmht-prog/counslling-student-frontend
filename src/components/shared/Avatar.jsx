export function Avatar({ name, size = 'md', className = '' }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' }
  return (
    <div className={`${sizes[size]} rounded-full bg-[#ff6b35] text-white font-bold flex items-center justify-center flex-shrink-0 ${className}`}>
      {initials}
    </div>
  )
}
