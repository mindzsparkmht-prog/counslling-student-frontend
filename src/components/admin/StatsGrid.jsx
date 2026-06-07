export function StatsGrid({ stats = [] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-[#1a1f36] mt-1">{s.value ?? '—'}</p>
              {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
            </div>
            {s.icon && (
              <div className={`p-2 rounded-lg ${s.iconBg || 'bg-orange-50'}`}>
                <s.icon size={20} className={s.iconColor || 'text-[#ff6b35]'} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
