import { useState, useEffect } from 'react'
import { IconSend, IconPlus, IconBell, IconNews, IconCheck, IconX, IconEdit, IconTrash } from '@tabler/icons-react'
import { Card } from '../../components/shared/Card'
import { Modal } from '../../components/shared/Modal'
import { Input, Select, Textarea } from '../../components/shared/Input'
import { Button } from '../../components/shared/Button'
import { Badge } from '../../components/shared/Badge'
import { toast } from '../../components/shared/Toast'
import { useNotifications } from '../../hooks/useNotifications'
import api from '../../lib/api'

const ANN_TYPES = [
  { value: 'news', label: 'News (MHT-CET Official)' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'urgent', label: 'Urgent' },
]

const TYPE_BADGE = {
  news: 'bg-gray-100 text-gray-700',
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
}

const ANN_EMPTY = { title: '', message: '', type: 'news', target_role: 'student', link: '', is_active: true }

export default function AdminNotifications() {
  const { notifications, markRead, markAllRead } = useNotifications()
  const [tab, setTab] = useState('announcements')

  // Announcements
  const [announcements, setAnnouncements] = useState([])
  const [annLoading, setAnnLoading] = useState(true)
  const [showAnnForm, setShowAnnForm] = useState(false)
  const [annForm, setAnnForm] = useState(ANN_EMPTY)
  const [savingAnn, setSavingAnn] = useState(false)
  const [editingAnn, setEditingAnn] = useState(null)

  // Broadcast
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [form, setForm] = useState({ target: 'all', type: 'info' })
  const [sending, setSending] = useState(false)

  useEffect(() => { loadAnnouncements() }, [])

  async function loadAnnouncements() {
    try {
      const res = await api.get('/api/admin/announcements')
      setAnnouncements(res.data)
    } catch { } finally { setAnnLoading(false) }
  }

  const openNewAnn = () => {
    setEditingAnn(null)
    setAnnForm(ANN_EMPTY)
    setShowAnnForm(true)
  }

  const openEditAnn = (ann) => {
    setEditingAnn(ann)
    setAnnForm({
      title: ann.title,
      message: ann.message,
      type: ann.type,
      target_role: ann.target_role || 'student',
      link: ann.link || '',
      is_active: ann.is_active,
    })
    setShowAnnForm(true)
  }

  const handleSaveAnn = async (e) => {
    e.preventDefault()
    if (!annForm.title || !annForm.message) return toast.error('Title and message required')
    setSavingAnn(true)
    try {
      const payload = { ...annForm, link: annForm.link || null }
      if (editingAnn) {
        await api.put(`/api/admin/announcements/${editingAnn.id}`, payload)
        toast.success('Announcement updated')
      } else {
        await api.post('/api/admin/announcements', payload)
        toast.success('Announcement posted')
      }
      setShowAnnForm(false)
      loadAnnouncements()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save')
    } finally { setSavingAnn(false) }
  }

  const handleToggleActive = async (ann) => {
    try {
      await api.put(`/api/admin/announcements/${ann.id}`, { is_active: !ann.is_active })
      loadAnnouncements()
    } catch { toast.error('Failed') }
  }

  const handleBroadcast = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await api.post('/api/notifications/broadcast', form)
      toast.success(`Broadcast sent to ${res.data.sent} users`)
      setShowBroadcast(false)
      setForm({ target: 'all', type: 'info' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send')
    } finally { setSending(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1a1f36]">Notifications</h1>
        <div className="flex gap-2">
          {tab === 'announcements' ? (
            <Button size="sm" onClick={openNewAnn}>
              <IconPlus size={14} /> Post Update
            </Button>
          ) : (
            <>
              <button onClick={markAllRead} className="text-xs text-[#ff6b35] font-medium">Mark all read</button>
              <Button size="sm" onClick={() => setShowBroadcast(true)}>
                <IconSend size={14} /> Broadcast
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {[
          { key: 'announcements', label: 'Important Updates', icon: IconNews },
          { key: 'inbox', label: 'My Inbox', icon: IconBell },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
              tab === key ? 'bg-white text-[#1a1f36] shadow-sm' : 'text-gray-500'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Announcements tab */}
      {tab === 'announcements' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">
            Updates posted here appear on the student dashboard and All Updates page. Use "News" type for official MHT-CET announcements.
          </p>
          {annLoading ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
          ) : announcements.length === 0 ? (
            <Card>
              <p className="text-center text-gray-400 py-8">No announcements yet. Post one to inform students.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {announcements.map(ann => (
                <Card key={ann.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${TYPE_BADGE[ann.type] || TYPE_BADGE.info}`}>
                          {ann.type?.toUpperCase()}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ann.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {ann.is_active ? 'ACTIVE' : 'HIDDEN'}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">{new Date(ann.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                      <p className="font-semibold text-sm text-[#1a1f36]">{ann.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ann.message}</p>
                      {ann.link && (
                        <a href={ann.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block">
                          {ann.link}
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleToggleActive(ann)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${ann.is_active ? 'bg-gray-100 hover:bg-gray-200' : 'bg-green-50 hover:bg-green-100'}`}
                        title={ann.is_active ? 'Hide' : 'Show'}
                      >
                        {ann.is_active ? <IconX size={14} className="text-gray-500" /> : <IconCheck size={14} className="text-green-600" />}
                      </button>
                      <button
                        onClick={() => openEditAnn(ann)}
                        className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center"
                      >
                        <IconEdit size={14} className="text-blue-500" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inbox tab */}
      {tab === 'inbox' && (
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No notifications</div>
          ) : notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              className={`bg-white rounded-xl border px-4 py-3 cursor-pointer transition-all ${
                n.is_read ? 'border-gray-100' : 'border-blue-100 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm font-semibold ${n.is_read ? 'text-gray-700' : 'text-[#1a1f36]'}`}>{n.title}</p>
                    <Badge label={n.type} />
                  </div>
                  <p className="text-xs text-gray-500">{n.message}</p>
                  <p className="text-xs text-gray-300 mt-1">{new Date(n.created_at).toLocaleString('en-IN')}</p>
                </div>
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Announcement Form Modal */}
      <Modal
        open={showAnnForm}
        onClose={() => setShowAnnForm(false)}
        title={editingAnn ? 'Edit Announcement' : 'Post Important Update'}
      >
        <form onSubmit={handleSaveAnn} className="space-y-3">
          <Input
            label="Title *"
            value={annForm.title}
            onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. MHT-CET PCM Answer Key Available"
            required
          />
          <Textarea
            label="Message *"
            rows={4}
            value={annForm.message}
            onChange={e => setAnnForm(f => ({ ...f, message: e.target.value }))}
            placeholder="Full details of the update..."
            required
          />
          <Input
            label="Link (optional)"
            value={annForm.link}
            onChange={e => setAnnForm(f => ({ ...f, link: e.target.value }))}
            placeholder="https://mahacet.org/..."
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Type"
              value={annForm.type}
              onChange={e => setAnnForm(f => ({ ...f, type: e.target.value }))}
            >
              {ANN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            <Select
              label="Target"
              value={annForm.target_role}
              onChange={e => setAnnForm(f => ({ ...f, target_role: e.target.value }))}
            >
              <option value="student">Students Only</option>
              <option value="counselor">Counselors Only</option>
              <option value="">All Users</option>
            </Select>
          </div>
          <Button type="submit" loading={savingAnn} className="w-full">
            {editingAnn ? 'Update' : 'Post Update'}
          </Button>
        </form>
      </Modal>

      {/* Broadcast Modal */}
      <Modal open={showBroadcast} onClose={() => setShowBroadcast(false)} title="Send Push Broadcast">
        <form onSubmit={handleBroadcast} className="space-y-3">
          <Input
            label="Title *"
            value={form.title || ''}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
          <Textarea
            label="Message *"
            rows={4}
            value={form.message || ''}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Target"
              value={form.target}
              onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
            >
              <option value="all">All Users</option>
              <option value="students">All Students</option>
              <option value="counselors">All Counselors</option>
            </Select>
            <Select
              label="Type"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="urgent">Urgent</option>
            </Select>
          </div>
          <Button type="submit" loading={sending} className="w-full">
            <IconSend size={15} /> Send Broadcast
          </Button>
        </form>
      </Modal>
    </div>
  )
}
