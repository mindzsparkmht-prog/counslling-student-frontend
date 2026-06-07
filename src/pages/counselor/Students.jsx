import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSearch, IconFilter } from '@tabler/icons-react'
import { StudentCard } from '../../components/counselor/StudentCard'
import { CardSkeleton } from '../../components/shared/Skeleton'
import { Select } from '../../components/shared/Input'
import api from '../../lib/api'

const STAGES = ['All Stages', '0 - Registration', '1 - Documents', '2 - Pref List', '3 - CAP Round 1', '4 - Seat Acceptance', '5 - Admitted']
const STATUSES = ['All Status', 'Active', 'Inactive', 'Admitted', 'Dropped']
const CATEGORIES = ['All Categories', 'Open', 'OBC', 'SC', 'ST', 'EWS', 'VJNT', 'SBC', 'SEBC']

export default function CounselorStudents() {
  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const navigate = useNavigate()

  useEffect(() => { loadStudents() }, [])

  useEffect(() => {
    let result = students
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(st =>
        st.user?.name?.toLowerCase().includes(s) ||
        st.member_id?.toLowerCase().includes(s) ||
        st.user?.phone?.includes(s)
      )
    }
    if (stageFilter !== '' && stageFilter !== 'All Stages') {
      result = result.filter(st => st.stage === parseInt(stageFilter.split(' - ')[0]))
    }
    if (statusFilter && statusFilter !== 'All Status') {
      result = result.filter(st => st.status === statusFilter)
    }
    if (categoryFilter && categoryFilter !== 'All Categories') {
      result = result.filter(st => st.category === categoryFilter)
    }
    setFiltered(result)
  }, [students, search, stageFilter, statusFilter, categoryFilter])

  async function loadStudents() {
    try {
      const res = await api.get('/api/students')
      setStudents(res.data)
      setFiltered(res.data)
    } catch { } finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1a1f36]">My Students</h1>
        <span className="text-sm text-gray-500">{filtered.length} students</span>
      </div>

      {/* Search */}
      <div className="relative">
        <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
          placeholder="Search by name, ID, phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-3 gap-2">
        <Select value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </Select>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </Select>
        <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </Select>
      </div>

      {/* Student list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No students found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <StudentCard key={s.id} student={s} onClick={() => navigate(`/counselor/students/${s.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}
