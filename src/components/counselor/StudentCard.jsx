import { Avatar } from '../shared/Avatar'
import { Badge } from '../shared/Badge'
import { IconPhone, IconChevronRight } from '@tabler/icons-react'

const stageLabels = ['Registration', 'Documents', 'Pref List', 'CAP Round 1', 'Seat', 'Admitted']

export function StudentCard({ student, onClick }) {
  const name = student.user?.name || student.member_id
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all"
    >
      <Avatar name={name} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-[#1a1f36] text-sm truncate">{name}</p>
          <Badge label={student.status || 'Active'} />
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{student.member_id}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            Stage: <span className="font-medium text-[#1a1f36]">{stageLabels[student.stage] || student.stage}</span>
          </span>
          {student.percentile && (
            <span className="text-xs text-gray-500">{student.percentile}%ile</span>
          )}
          {student.category && (
            <span className="text-xs text-gray-400">{student.category}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        {student.user?.phone && (
          <a
            href={`tel:${student.user.phone}`}
            onClick={e => e.stopPropagation()}
            className="text-blue-500 hover:text-blue-600"
          >
            <IconPhone size={16} />
          </a>
        )}
        <IconChevronRight size={16} className="text-gray-300" />
      </div>
    </div>
  )
}
