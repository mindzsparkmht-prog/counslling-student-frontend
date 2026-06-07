import { useState, useEffect } from 'react'
import {
  IconPlus, IconEdit, IconTrash, IconCheck, IconCircle,
  IconCalendarEvent, IconExternalLink, IconAlertCircle
} from '@tabler/icons-react'
import { Modal } from '../../components/shared/Modal'
import { Input, Textarea } from '../../components/shared/Input'
import { Button } from '../../components/shared/Button'
import { toast } from '../../components/shared/Toast'
import api from '../../lib/api'

const EMPTY = {
  event_name: '', event_date: '', description: '', notes: '',
  alert_message: '', important_message: '', changes: '', link: ''
}

export default function AdminCAPTimeline() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadEvents() }, [])

  async function loadEvents() {
    try {
      const res = await api.get('/api/admin/timeline')
      setEvents(res.data)
    } catch { } finally { setLoading(false) }
  }

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY)
    setShowForm(true)
  }

  const openEdit = (ev) => {
    setEditing(ev)
    setForm({
      event_name: ev.event_name || '',
      event_date: ev.event_date?.split('T')[0] || '',
      description: ev.description || '',
      notes: ev.notes || '',
      alert_message: ev.alert_message || '',
      important_message: ev.important_message || '',
      changes: ev.changes || '',
      link: ev.link || '',
    })
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.event_name || !form.event_date) return toast.error('Event name and date are required')
    setSaving(true)
    try {
      const payload = { ...form, link: form.link || null }
      if (editing) {
        await api.put(`/api/admin/timeline/${editing.id}`, payload)
        toast.success('Event updated')
      } else {
        await api.post('/api/admin/timeline', payload)
        toast.success('Event added')
      }
      setShowForm(false)
      loadEvents()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleToggleDone = async (ev) => {
    try {
      await api.put(`/api/admin/timeline/${ev.id}`, { is_done: !ev.is_done })
      setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, is_done: !e.is_done } : e))
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async (ev) => {
    if (!window.confirm(`Delete "${ev.event_name}"?`)) return
    try {
      await api.delete(`/api/admin/timeline/${ev.id}`)
      toast.success('Event deleted')
      setEvents(prev => prev.filter(e => e.id !== ev.id))
    } catch { toast.error('Failed to delete') }
  }

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const doneCount = events.filter(e => e.is_done || new Date(e.event_date) < today).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36]">CAP Timeline</h1>
          <p className="text-sm text-gray-400">MHT-CET 2026 counselling dates visible to all students</p>
        </div>
        <Button size="sm" onClick={openNew}>
          <IconPlus size={14} /> Add Event
        </Button>
      </div>

      {/* Progress bar */}
      {events.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">Timeline Progress</span>
              <span className="text-xs text-gray-400">{doneCount} / {events.length} completed</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-[#ff6b35] h-2 rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / events.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center py-10 text-gray-400 text-sm">Loading...</p>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <IconCalendarEvent size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No timeline events yet</p>
          <p className="text-xs mt-1">Add MHT-CET 2026 important dates for students</p>
          <Button size="sm" className="mt-4" onClick={openNew}>
            <IconPlus size={14} /> Add First Event
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200 z-0" />
          <div className="space-y-2">
            {events.map(ev => {
              const eventDate = new Date(ev.event_date)
              const isPast = ev.is_done || eventDate < today
              const diff = Math.ceil((eventDate - today) / 86400000)
              const hasAlert = ev.alert_message || ev.important_message

              return (
                <div key={ev.id} className="relative flex gap-4">
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                    isPast ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
                  }`}>
                    {isPast
                      ? <IconCheck size={18} className="text-white" />
                      : <IconCircle size={14} className="text-gray-300 fill-gray-100" />
                    }
                  </div>

                  <div className={`flex-1 bg-white rounded-xl border px-4 py-3 ${
                    isPast ? 'border-gray-100 opacity-75' : 'border-gray-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-semibold text-sm ${isPast ? 'text-gray-400' : 'text-[#1a1f36]'}`}>
                            {ev.event_name}
                          </p>
                          {!isPast && diff >= 0 && diff <= 7 && (
                            <span className="text-[10px] font-bold bg-[#ff6b35] text-white px-2 py-0.5 rounded-full">
                              {diff === 0 ? 'TODAY' : `${diff}d left`}
                            </span>
                          )}
                          {isPast && (
                            <span className="text-[10px] font-semibold bg-green-100 text-green-600 px-2 py-0.5 rounded-full">DONE</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {eventDate.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                        {ev.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ev.description}</p>
                        )}
                        {hasAlert && (
                          <div className="flex items-center gap-1 mt-1">
                            <IconAlertCircle size={12} className="text-amber-400" />
                            <p className="text-[11px] text-amber-600 font-medium line-clamp-1">
                              {ev.important_message || ev.alert_message}
                            </p>
                          </div>
                        )}
                        {ev.link && (
                          <a href={ev.link} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-500 hover:underline mt-1">
                            <IconExternalLink size={11} /> Official link
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleToggleDone(ev)}
                          title={isPast ? 'Mark as upcoming' : 'Mark as done'}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isPast
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          <IconCheck size={14} />
                        </button>
                        <button
                          onClick={() => openEdit(ev)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center"
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(ev)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Form Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Timeline Event' : 'Add Timeline Event'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-3">
          <Input
            label="Event Name *"
            value={form.event_name}
            onChange={e => setForm(f => ({ ...f, event_name: e.target.value }))}
            placeholder="e.g. MHT-CET 2026 Result Declaration"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Event Date *"
              type="date"
              value={form.event_date}
              onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
              required
            />
            <Input
              label="Official Link"
              value={form.link}
              onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
              placeholder="https://cetcell.mahacet.org/..."
            />
          </div>
          <Textarea
            label="Description"
            rows={2}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief description of this event"
          />
          <Input
            label="Important Message"
            value={form.important_message}
            onChange={e => setForm(f => ({ ...f, important_message: e.target.value }))}
            placeholder="Highlighted in amber — key action needed"
          />
          <Input
            label="Alert Message"
            value={form.alert_message}
            onChange={e => setForm(f => ({ ...f, alert_message: e.target.value }))}
            placeholder="Highlighted in red — urgent warning"
          />
          <Textarea
            label="Notes"
            rows={2}
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Additional notes visible to students"
          />
          <Textarea
            label="What Changed"
            rows={2}
            value={form.changes}
            onChange={e => setForm(f => ({ ...f, changes: e.target.value }))}
            placeholder="List any date changes or updates (one per line)"
          />
          <Button type="submit" loading={saving} className="w-full">
            {editing ? 'Update Event' : 'Add Event'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
