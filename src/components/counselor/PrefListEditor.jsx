import { useState, useRef } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IconGripVertical, IconTrash, IconPlus, IconCircleFilled } from '@tabler/icons-react'
import { Input, Select } from '../shared/Input'

function EditableRow({ entry, onUpdate, onDelete, dragHandleProps, dragRef, style }) {
  const confidenceColor = entry.confidence === 'high' ? 'text-green-500'
    : entry.confidence === 'medium' ? 'text-amber-500' : 'text-red-400'

  return (
    <tr ref={dragRef} style={style} className={`border-b border-gray-100 hover:bg-gray-50 ${entry.confidence === 'low' ? 'bg-yellow-50' : ''}`}>
      <td className="px-2 py-1.5 text-center">
        <button {...dragHandleProps} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none p-1">
          <IconGripVertical size={16} />
        </button>
      </td>
      <td className="px-2 py-1.5 text-center text-xs text-gray-500 font-medium w-10">{entry.rank}</td>
      <td className="px-2 py-1.5">
        <input
          className="w-full text-sm border-0 bg-transparent focus:outline-none focus:bg-white focus:border focus:border-gray-200 focus:rounded px-1"
          value={entry.college_name}
          onChange={e => onUpdate({ ...entry, college_name: e.target.value })}
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          className="w-full text-sm border-0 bg-transparent focus:outline-none focus:bg-white focus:border focus:border-gray-200 focus:rounded px-1"
          value={entry.branch || ''}
          onChange={e => onUpdate({ ...entry, branch: e.target.value })}
        />
      </td>
      <td className="px-2 py-1.5">
        <select
          className="text-xs border-0 bg-transparent focus:outline-none"
          value={entry.type || 'Unaided'}
          onChange={e => onUpdate({ ...entry, type: e.target.value })}
        >
          <option>Government</option>
          <option>Government Aided</option>
          <option>Unaided</option>
        </select>
      </td>
      <td className="px-2 py-1.5">
        <input
          className="w-24 text-sm border-0 bg-transparent focus:outline-none px-1"
          value={entry.city || ''}
          onChange={e => onUpdate({ ...entry, city: e.target.value })}
        />
      </td>
      <td className="px-2 py-1.5 text-right">
        <input
          className="w-16 text-xs border-0 bg-transparent focus:outline-none text-right"
          value={entry.cutoff || ''}
          onChange={e => onUpdate({ ...entry, cutoff: e.target.value ? parseFloat(e.target.value) : null })}
          type="number"
          step="0.01"
        />
      </td>
      <td className="px-2 py-1.5 text-center">
        <IconCircleFilled size={12} className={confidenceColor} />
      </td>
      <td className="px-2 py-1.5 text-center">
        <button onClick={onDelete} className="text-red-300 hover:text-red-500 transition-colors">
          <IconTrash size={15} />
        </button>
      </td>
    </tr>
  )
}

function SortableRow({ entry, onUpdate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  return (
    <EditableRow
      entry={entry}
      onUpdate={onUpdate}
      onDelete={onDelete}
      dragRef={setNodeRef}
      style={style}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  )
}

export function PrefListEditor({ entries, onChange }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldI = entries.findIndex(e => e.id === active.id)
    const newI = entries.findIndex(e => e.id === over.id)
    const reordered = arrayMove(entries, oldI, newI).map((e, i) => ({ ...e, rank: i + 1 }))
    onChange(reordered)
  }

  const updateEntry = (updated) => {
    onChange(entries.map(e => e.id === updated.id ? updated : e))
  }

  const deleteEntry = (id) => {
    onChange(entries.filter(e => e.id !== id).map((e, i) => ({ ...e, rank: i + 1 })))
  }

  const addRow = () => {
    const newEntry = {
      id: `entry_new_${Date.now()}`,
      rank: entries.length + 1,
      college_name: '',
      branch: '',
      type: 'Unaided',
      city: '',
      cutoff: null,
      zone: '',
      confidence: 'high'
    }
    onChange([...entries, newEntry])
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#1a1f36] text-white text-xs">
            <th className="px-2 py-2 w-8"></th>
            <th className="px-2 py-2 w-10">#</th>
            <th className="px-2 py-2 text-left">College Name</th>
            <th className="px-2 py-2 text-left">Branch</th>
            <th className="px-2 py-2 text-left">Type</th>
            <th className="px-2 py-2 text-left">City</th>
            <th className="px-2 py-2 text-right">Cutoff</th>
            <th className="px-2 py-2 w-8" title="Confidence"></th>
            <th className="px-2 py-2 w-8"></th>
          </tr>
        </thead>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={entries.map(e => e.id)} strategy={verticalListSortingStrategy}>
            <tbody>
              {entries.map(entry => (
                <SortableRow
                  key={entry.id}
                  entry={entry}
                  onUpdate={updateEntry}
                  onDelete={() => deleteEntry(entry.id)}
                />
              ))}
            </tbody>
          </SortableContext>
        </DndContext>
      </table>
      <button
        onClick={addRow}
        className="mt-2 flex items-center gap-2 text-sm text-[#ff6b35] hover:text-orange-600 font-medium px-2 py-1"
      >
        <IconPlus size={16} /> Add Row
      </button>
    </div>
  )
}
