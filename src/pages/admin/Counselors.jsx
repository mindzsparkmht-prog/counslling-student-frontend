import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconUserPlus, IconStar } from '@tabler/icons-react'
import { Avatar } from '../../components/shared/Avatar'
import { Modal } from '../../components/shared/Modal'
import { Input } from '../../components/shared/Input'
import { Button } from '../../components/shared/Button'
import { Badge } from '../../components/shared/Badge'
import { toast } from '../../components/shared/Toast'
import api from '../../lib/api'

export default function AdminCounselors() {
  const [counselors, setCounselors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({})
  const [adding, setAdding] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const res = await api.get('/api/counselors')
      setCounselors(res.data)
    } catch { } finally { setLoading(false) }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      const res = await api.post('/api/counselors', form)
      toast.success(`Counselor ${res.data.counselor.member_id} created. Setup email sent.`)
      setShowAdd(false)
      setForm({})
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create counselor')
    } finally { setAdding(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1a1f36]">Counselors</h1>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <IconUserPlus size={16} /> Add Counselor
        </Button>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <p className="text-center py-8 text-gray-400 text-sm">Loading...</p>
        ) : counselors.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">No counselors yet</p>
        ) : counselors.map(c => (
          <div key={c.id} onClick={() => navigate(`/admin/counselors/${c.id}`)}
            className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer active:bg-gray-50">
            <div className="flex items-center gap-3">
              <Avatar name={c.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#1a1f36] truncate">{c.name}</p>
                <p className="text-xs text-gray-400">{c.member_id} · {c.phone || c.email}</p>
              </div>
              <Badge label={c.is_active ? 'Active' : 'Inactive'} />
            </div>
            <div className="flex items-center gap-4 mt-2 pl-10">
              <span className="text-xs text-gray-500">{c.student_count} students</span>
              {c.avg_rating && (
                <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                  <IconStar size={12} className="fill-amber-400" />{c.avg_rating}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1f36] text-white text-xs">
              <th className="text-left px-4 py-3">Counselor</th>
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-right px-4 py-3">Students</th>
              <th className="text-right px-4 py-3">Rating</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : counselors.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No counselors yet</td></tr>
            ) : counselors.map(c => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/counselors/${c.id}`)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={c.name} size="sm" />
                    <div>
                      <p className="font-medium text-[#1a1f36]">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{c.member_id}</td>
                <td className="px-4 py-3 text-gray-600">{c.phone || '—'}</td>
                <td className="px-4 py-3 text-right font-semibold text-[#1a1f36]">{c.student_count}</td>
                <td className="px-4 py-3 text-right">
                  {c.avg_rating ? (
                    <span className="flex items-center justify-end gap-1 font-semibold text-amber-500">
                      <IconStar size={13} className="fill-amber-400" />{c.avg_rating}
                    </span>
                  ) : <span className="text-gray-300 text-right block">—</span>}
                </td>
                <td className="px-4 py-3"><Badge label={c.is_active ? 'Active' : 'Inactive'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Counselor Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Counselor">
        <form onSubmit={handleAdd} className="space-y-3">
          <Input label="Full Name *" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Email *" type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input label="Phone" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <Button type="submit" loading={adding} className="w-full">Create Counselor & Send Setup Email</Button>
        </form>
      </Modal>
    </div>
  )
}
