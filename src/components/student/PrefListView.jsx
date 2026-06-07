import { useState } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy, arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IconGripVertical, IconSchool, IconMapPin, IconStar } from '@tabler/icons-react'

function CollegeCard({ entry, index, isDraggable }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const rankColor = index === 0 ? 'bg-[#ff6b35] text-white'
    : index < 3 ? 'bg-orange-100 text-orange-700'
    : index < 10 ? 'bg-blue-100 text-blue-700'
    : 'bg-gray-100 text-gray-600'

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 shadow-sm">
      {isDraggable && (
        <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none">
          <IconGripVertical size={18} />
        </button>
      )}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${rankColor}`}>
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1a1f36] text-sm truncate">{entry.college_name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {entry.branch && <span className="text-xs text-gray-500 flex items-center gap-0.5"><IconSchool size={11} />{entry.branch}</span>}
          {entry.city && <span className="text-xs text-gray-400 flex items-center gap-0.5"><IconMapPin size={11} />{entry.city}</span>}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {entry.cutoff && (
          <span className="text-xs bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5 text-gray-600 font-medium">
            {entry.cutoff}%ile
          </span>
        )}
        {entry.type && (
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
            entry.type === 'Government' ? 'bg-green-100 text-green-700'
            : entry.type === 'Government Aided' ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600'
          }`}>{entry.type === 'Government' ? 'Govt' : entry.type === 'Government Aided' ? 'Aided' : 'Pvt'}</span>
        )}
      </div>
    </div>
  )
}

export function PrefListView({ list, onReorder }) {
  const entries = list.student_order?.length ? list.student_order : list.entries
  const [items, setItems] = useState(entries || [])
  const isDraggable = !list.is_locked && !!onReorder

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    const newOrder = arrayMove(items, oldIndex, newIndex).map((item, i) => ({ ...item, rank: i + 1 }))
    setItems(newOrder)
    onReorder?.(newOrder)
  }

  if (!items.length) return (
    <div className="text-center py-8 text-gray-400 text-sm">No entries in this list</div>
  )

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((entry, index) => (
            <CollegeCard key={entry.id} entry={entry} index={index} isDraggable={isDraggable} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
