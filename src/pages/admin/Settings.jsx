import { useState, useEffect } from 'react'
import { IconEdit, IconCheck, IconPlus, IconTrash, IconX } from '@tabler/icons-react'
import { Card } from '../../components/shared/Card'
import { Input, Textarea } from '../../components/shared/Input'
import { Button } from '../../components/shared/Button'
import { Modal } from '../../components/shared/Modal'
import { toast } from '../../components/shared/Toast'
import api from '../../lib/api'

const EMPTY_EVENT = {
  event_name: '', event_date: '', description: '',
  notes: '', alert_message: '', important_message: '', changes: '', link: '',
  display_order: '', is_done: false
}

export default function AdminSettings() {
  const [timeline, setTimeline] = useState([])
  const [tab, setTab] = useState('timeline')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_EVENT)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { loadTimeline() }, [])

  async function loadTimeline() {
    try {
      const res = await api.get('/api/admin/timeline')
      setTimeline(res.data)
    } catch { }
  }

  const openAdd = () => {
    setEditId(null)
    setForm({ ...EMPTY_EVENT, display_order: (timeline.length + 1).toString() })
    setShowForm(true)
  }

  const openEdit = (ev) => {
    setEditId(ev.id)
    setForm({
      event_name: ev.event_name || '',
      event_date: ev.event_date || '',
      description: ev.description || '',
      notes: ev.notes || '',
      alert_message: ev.alert_message || '',
      important_message: ev.important_message || '',
      changes: ev.changes || '',
      link: ev.link || '',
      display_order: ev.display_order?.toString() || '',
      is_done: ev.is_done || false,
    })
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.event_name || !form.event_date) return toast.error('Name and date are required')
    setSaving(true)
    try {
      const payload = {
        ...form,
        display_order: form.display_order ? parseInt(form.display_order) : undefined,
        link: form.link || null,
        notes: form.notes || null,
        alert_message: form.alert_message || null,
        important_message: form.important_message || null,
        changes: form.changes || null,
      }
      if (editId) {
        await api.put(`/api/admin/timeline/${editId}`, payload)
        toast.success('Event updated')
      } else {
        await api.post('/api/admin/timeline', payload)
        toast.success('Event added')
      }
      setShowForm(false)
      loadTimeline()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleToggleDone = async (ev) => {
    try {
      await api.put(`/api/admin/timeline/${ev.id}`, { ...ev, is_done: !ev.is_done })
      loadTimeline()
    } catch { toast.error('Update failed') }
  }

  const handleDelete = async (ev) => {
    if (!window.confirm(`Delete "${ev.event_name}"?`)) return
    setDeleting(ev.id)
    try {
      await api.delete(`/api/admin/timeline/${ev.id}`)
      toast.success('Event deleted')
      loadTimeline()
    } catch { toast.error('Delete failed') } finally { setDeleting(null) }
  }

  const f = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#1a1f36]">Settings</h1>

      <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
        {['timeline'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
              tab === t ? 'bg-white text-[#1a1f36] shadow-sm' : 'text-gray-500'
            }`}>
            CAP Timeline
          </button>
        ))}
      </div>

      {/* SQL migration note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-700 font-medium">Supabase SQL required for extra fields:</p>
        <code className="text-[10px] text-blue-600 block mt-1 whitespace-pre-wrap">
          {`ALTER TABLE cap_timeline\nADD COLUMN IF NOT EXISTS notes TEXT,\nADD COLUMN IF NOT EXISTS alert_message TEXT,\nADD COLUMN IF NOT EXISTS important_message TEXT,\nADD COLUMN IF NOT EXISTS changes TEXT,\nADD COLUMN IF NOT EXISTS link TEXT;`}
        </code>
      </div>

      {/* TIMELINE TAB */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{timeline.length} events</p>
        <Button size="sm" onClick={openAdd}>
          <IconPlus size={14} /> Add Event
        </Button>
      </div>

      <div className="space-y-3">
        {timeline.length === 0 && (
          <Card><p className="text-center text-gray-400 py-6">No timeline events yet</p></Card>
        )}
        {timeline.map(ev => (
          <Card key={ev.id}>
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggleDone(ev)}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  ev.is_done ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'
                }`}
              >
                {ev.is_done && <IconCheck size={13} className="text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${ev.is_done ? 'line-through text-gray-400' : 'text-[#1a1f36]'}`}>
                  {ev.event_name}
                </p>
                <p className="text-xs text-[#ff6b35] font-medium mt-0.5">{ev.event_date}</p>
                {ev.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{ev.description}</p>}
                <div className="flex gap-3 mt-1">
                  {ev.alert_message && <span className="text-[10px] font-semibold text-red-500">⚠ Alert</span>}
                  {ev.important_message && <span className="text-[10px] font-semibold text-amber-500">★ Important</span>}
                  {ev.notes && <span className="text-[10px] text-gray-400">Notes</span>}
                  {ev.link && <span className="text-[10px] text-blue-400">Link</span>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEdit(ev)} className="w-8 h-8 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center">
                  <IconEdit size={14} className="text-blue-500" />
                </button>
                <button
                  onClick={() => handleDelete(ev)}
                  disabled={deleting === ev.id}
                  className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center disabled:opacity-40"
                >
                  <IconTrash size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Timeline Event' : 'Add Timeline Event'}>
        <form onSubmit={handleSave} className="space-y-3">
          <Input label="Event Name *" placeholder="e.g. CAP Registration Opens" {...f('event_name')} required />
          <Input label="Event Date *" type="date" {...f('event_date')} required />
          <Input label="Display Order" type="number" placeholder="1, 2, 3..." {...f('display_order')} />
          <Textarea label="Description" rows={2} placeholder="Brief summary of what happens on this date..." {...f('description')} />
          <Textarea label="Important Message" rows={2} placeholder="Highlighted message students must know..." {...f('important_message')} />
          <Textarea label="Alert" rows={2} placeholder="Warning or deadline alert..." {...f('alert_message')} />
          <Textarea label="What Changed / Updates" rows={2} placeholder="List any recent changes to this event..." {...f('changes')} />
          <Textarea label="Notes" rows={2} placeholder="Additional notes or tips for students..." {...f('notes')} />
          <Input label="Official Link" placeholder="https://mahacet.org/..." {...f('link')} />
          {editId && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_done}
                onChange={e => setForm(p => ({ ...p, is_done: e.target.checked }))}
                className="w-4 h-4 accent-green-500"
              />
              <span className="text-sm text-gray-600">Mark as completed</span>
            </label>
          )}
          <div className="flex gap-2 pt-1">
            <Button type="submit" loading={saving} className="flex-1">{editId ? 'Update' : 'Add Event'}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
