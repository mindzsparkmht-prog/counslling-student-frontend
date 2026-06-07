const stageLabels = ['Registration', 'Documents', 'Pref List', 'CAP Round 1', 'Seat Acceptance', 'Admitted']
const colors = ['bg-gray-300', 'bg-blue-400', 'bg-yellow-400', 'bg-orange-400', 'bg-orange-500', 'bg-green-500']

export function StageFunnel({ stageCounts = [] }) {
  const max = Math.max(...stageCounts, 1)
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-[#1a1f36] mb-4">Stage Breakdown</h3>
      <div className="space-y-2">
        {stageLabels.map((label, i) => {
          const count = stageCounts[i] || 0
          const pct = Math.round((count / max) * 100)
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-28 flex-shrink-0">{label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full ${colors[i]} rounded-full transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-[#1a1f36] w-8 text-right">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
