import { IconCheck } from '@tabler/icons-react'

const stages = [
  { label: 'Registration', short: 'Reg' },
  { label: 'Documents', short: 'Docs' },
  { label: 'Pref List', short: 'Pref' },
  { label: 'CAP Round 1', short: 'CAP1' },
  { label: 'Seat Acceptance', short: 'Seat' },
  { label: 'Admitted', short: 'Done' },
]

export function StageTracker({ currentStage = 0 }) {
  return (
    <div className="overflow-x-auto -mx-1 px-1 pb-1">
      <div className="flex items-center min-w-max gap-0">
        {stages.map((stage, i) => {
          const done = i < currentStage
          const active = i === currentStage
          return (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done ? 'bg-[#ff6b35] border-[#ff6b35] text-white'
                  : active ? 'bg-white border-[#ff6b35] text-[#ff6b35]'
                  : 'bg-white border-gray-200 text-gray-400'
                }`}>
                  {done ? <IconCheck size={14} /> : i + 1}
                </div>
                <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                  done || active ? 'text-[#1a1f36]' : 'text-gray-400'
                }`}>
                  {stage.short}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div className={`h-0.5 w-8 mx-0.5 -mt-4 ${i < currentStage ? 'bg-[#ff6b35]' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
