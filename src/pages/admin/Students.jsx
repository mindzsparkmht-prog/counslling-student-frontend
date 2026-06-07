import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSearch, IconUserPlus, IconChevronRight } from '@tabler/icons-react'
import { Badge } from '../../components/shared/Badge'
import { Avatar } from '../../components/shared/Avatar'
import { Modal } from '../../components/shared/Modal'
import { Input, Select } from '../../components/shared/Input'
import { Button } from '../../components/shared/Button'
import { toast } from '../../components/shared/Toast'
import api from '../../lib/api'

const STAGES = ['All', '0', '1', '2', '3', '4', '5']
const STATUSES = ['All', 'Active', 'Inactive', 'Admitted', 'Dropped']
const CATEGORIES = ['All', 'Open', 'OBC', 'SC', 'ST', 'EWS', 'VJNT', 'SBC', 'SEBC']

const stageLabels = ['Reg', 'Docs', 'Pref', 'CAP1', 'Seat', 'Done']

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [counselors, setCounselors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [catFilter, setCatFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({})
  const [adding, setAdding] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    let result = students
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(st =>
        st.user?.name?.toLowerCase().includes(s) ||
        st.member_id?.toLowerCase().includes(s) ||
        st.user?.email?.toLowerCase().includes(s)
      )
    }
    if (stageFilter !== 'All') result = result.filter(st => st.stage === parseInt(stageFilter))
    if (statusFilter !== 'All') result = result.filter(st => st.status === statusFilter)
    if (catFilter !== 'All') result = result.filter(st => st.category === catFilter)
    setFiltered(result)
  }, [students, search, stageFilter, statusFilter, catFilter])

  async function loadData() {
    try {
      const [studRes, cRes] = await Promise.all([
        api.get('/api/students'),
        api.get('/api/counselors')
      ])
      setStudents(studRes.data)
      setCounselors(cRes.data)
    } catch { } finally { setLoading(false) }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      const res = await api.post('/api/students', form)
      toast.success(`Student ${res.data.student.member_id} created. Setup email sent.`)
      setShowAdd(false)
      setForm({})
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create student')
    } finally { setAdding(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1a1f36]">Students</h1>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <IconUserPlus size={16} /> Add Student
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
            placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Select value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
          {STAGES.map(s => <option key={s}>{s === 'All' ? 'All Stages' : `Stage ${s}`}</option>)}
        </Select>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </Select>
        <Select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </Select>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <p className="text-center py-8 text-gray-400 text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">No students found</p>
        ) : filtered.map(s => (
          <div key={s.id} onClick={() => navigate(`/admin/students/${s.id}`)}
            className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer active:bg-gray-50">
            <div className="flex items-center gap-3 mb-2">
              <Avatar name={s.user?.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#1a1f36] truncate">{s.user?.name}</p>
                <p className="text-xs text-gray-400">{s.member_id} · {s.user?.phone}</p>
              </div>
              <IconChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {stageLabels[s.stage] || `Stage ${s.stage}`}
              </span>
              <Badge label={s.status} />
              <Badge label={s.payment_status} />
              {s.category && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.category}</span>}
              {s.percentile && <span className="text-xs text-gray-500">{s.percentile}%ile</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1f36] text-white text-xs">
              <th className="text-left px-4 py-3">Student</th>
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-right px-4 py-3">%ile</th>
              <th className="text-left px-4 py-3">Cat</th>
              <th className="text-left px-4 py-3">Stage</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Payment</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">No students found</td></tr>
            ) : filtered.map(s => (
              <tr key={s.id} onClick={() => navigate(`/admin/students/${s.id}`)}
                className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={s.user?.name} size="sm" />
                    <div>
                      <p className="font-medium text-[#1a1f36] text-sm">{s.user?.name}</p>
                      <p className="text-xs text-gray-400">{s.user?.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.member_id}</td>
                <td className="px-4 py-3 text-right font-semibold text-[#1a1f36]">{s.percentile || '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{s.category || '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {stageLabels[s.stage] || s.stage}
                  </span>
                </td>
                <td className="px-4 py-3"><Badge label={s.status} /></td>
                <td className="px-4 py-3"><Badge label={s.payment_status} /></td>
                <td className="px-4 py-3 text-gray-300"><IconChevronRight size={16} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Student" size="lg">
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full Name *" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Input label="Email *" type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <Input label="Phone" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Select label="Category" value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Select</option>
              {['Open', 'OBC', 'SC', 'ST', 'EWS', 'VJNT', 'SBC', 'SEBC'].map(c => <option key={c}>{c}</option>)}
            </Select>
            <Input label="CET Score" type="number" value={form.cet_score || ''} onChange={e => setForm(f => ({ ...f, cet_score: e.target.value }))} />
            <Input label="Percentile" type="number" step="0.01" value={form.percentile || ''} onChange={e => setForm(f => ({ ...f, percentile: e.target.value }))} />
            <Input label="Branch Preference" value={form.branch_preference || ''} onChange={e => setForm(f => ({ ...f, branch_preference: e.target.value }))} />
            <Input label="City" value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            <Select label="Assign Counselor" value={form.counselor_id || ''} onChange={e => setForm(f => ({ ...f, counselor_id: e.target.value }))}>
              <option value="">Unassigned</option>
              {counselors.map(c => <option key={c.id} value={c.id}>{c.name} ({c.member_id})</option>)}
            </Select>
            <Select label="Payment Status" value={form.payment_status || 'Pending'} onChange={e => setForm(f => ({ ...f, payment_status: e.target.value }))}>
              {['Pending', 'Partial', 'Paid'].map(p => <option key={p}>{p}</option>)}
            </Select>
          </div>
          <Button type="submit" loading={adding} className="w-full">Create Student & Send Setup Email</Button>
        </form>
      </Modal>
    </div>
  )
}
