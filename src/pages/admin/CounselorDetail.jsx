import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  IconArrowLeft, IconUserPlus, IconCheck, IconX,
  IconUsers, IconShieldCheck, IconToggleLeft, IconToggleRight
} from '@tabler/icons-react'
import { Avatar } from '../../components/shared/Avatar'
import { Badge } from '../../components/shared/Badge'
import { Button } from '../../components/shared/Button'
import { Modal } from '../../components/shared/Modal'
import { Select } from '../../components/shared/Input'
import { toast } from '../../components/shared/Toast'
import api from '../../lib/api'

const PERMISSION_LABELS = [
  { key: 'pref_list_manage',  label: 'Preference List',    desc: 'Upload, edit, delete and publish preference lists' },
  { key: 'documents_manage',  label: 'Document Verify',    desc: 'Verify or reject student documents' },
  { key: 'sessions_manage',   label: 'Session Management', desc: 'Create and manage counseling sessions' },
  { key: 'students_edit',     label: 'Edit Student Info',  desc: 'Edit student profile, scores, and details' },
  { key: 'stage_update',      label: 'Update Stage',       desc: 'Move student to next counseling stage' },
  { key: 'notes_manage',      label: 'Notes',              desc: 'Create and manage student notes' },
]

const DEFAULT_PERMISSIONS = Object.fromEntries(PERMISSION_LABELS.map(p => [p.key, true]))

export default function AdminCounselorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [counselor, setCounselor] = useState(null)
  const [students, setStudents] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => { loadAll() }, [id])

  async function loadAll() {
    try {
      const [cRes, sRes, allRes] = await Promise.all([
        api.get(`/api/counselors/${id}`),
        api.get(`/api/counselors/${id}/students`),
        api.get('/api/students')
      ])
      setCounselor(cRes.data)
      setStudents(sRes.data)
      setAllStudents(allRes.data)
      // Merge stored permissions with defaults so new keys always appear
      setPermissions({ ...DEFAULT_PERMISSIONS, ...(cRes.data.permissions || {}) })
    } catch { toast.error('Failed to load counselor') }
    finally { setLoading(false) }
  }

  const handlePermissionToggle = (key) => {
    setPermissions(p => ({ ...p, [key]: !p[key] }))
  }

  const handleSavePermissions = async () => {
    setSaving(true)
    try {
      await api.put(`/api/counselors/${id}/permissions`, { permissions })
      toast.success('Permissions saved')
      setCounselor(c => ({ ...c, permissions }))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save permissions')
    } finally { setSaving(false) }
  }

  const handleToggleStatus = async () => {
    try {
      const res = await api.put(`/api/counselors/${id}/status`, { is_active: !counselor.is_active })
      setCounselor(c => ({ ...c, is_active: res.data.is_active }))
      toast.success(`Counselor ${res.data.is_active ? 'activated' : 'deactivated'}`)
    } catch { toast.error('Failed to update status') }
  }

  const handleAssignStudent = async () => {
    if (!selectedStudent) return
    setAssigning(true)
    try {
      await api.put(`/api/students/${selectedStudent}/counselor`, { counselor_id: id })
      toast.success('Student assigned')
      setShowAssign(false)
      setSelectedStudent('')
      loadAll()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign student')
    } finally { setAssigning(false) }
  }

  const handleUnassignStudent = async (studentId) => {
    if (!confirm('Remove this student from counselor?')) return
    try {
      await api.put(`/api/students/${studentId}/counselor`, { counselor_id: null })
      toast.success('Student unassigned')
      loadAll()
    } catch { toast.error('Failed to unassign student') }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>
  if (!counselor) return <div className="p-8 text-center text-gray-400">Counselor not found</div>

  // Students not yet assigned to this counselor
  const unassigned = allStudents.filter(s => s.counselor_id !== id && !s.counselor_id)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <IconArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <Avatar name={counselor.name} size="lg" />
          <div>
            <h1 className="text-xl font-bold text-[#1a1f36]">{counselor.name}</h1>
            <p className="text-sm text-gray-500">{counselor.member_id} · {counselor.email}</p>
          </div>
        </div>
        <Badge label={counselor.is_active ? 'Active' : 'Inactive'} color={counselor.is_active ? 'green' : 'red'} />
        <button
          onClick={handleToggleStatus}
          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            counselor.is_active
              ? 'border-red-200 text-red-600 hover:bg-red-50'
              : 'border-green-200 text-green-600 hover:bg-green-50'
          }`}
        >
          {counselor.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-[#1a1f36]">{students.length}</p>
          <p className="text-xs text-gray-500 mt-1">Assigned Students</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-[#1a1f36]">{counselor.avg_rating || '—'}</p>
          <p className="text-xs text-gray-500 mt-1">Avg Rating</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-[#1a1f36]">{counselor.phone || '—'}</p>
          <p className="text-xs text-gray-500 mt-1">Phone</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Permissions Panel */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <IconShieldCheck size={18} className="text-[#ff6b35]" />
            <h2 className="font-semibold text-[#1a1f36]">Feature Permissions</h2>
          </div>

          <div className="space-y-3">
            {PERMISSION_LABELS.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#1a1f36]">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <button
                  onClick={() => handlePermissionToggle(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    permissions[key]
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  {permissions[key]
                    ? <><IconCheck size={13} /> Allowed</>
                    : <><IconX size={13} /> Denied</>
                  }
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSavePermissions}
            loading={saving}
            className="w-full mt-4"
            size="sm"
          >
            Save Permissions
          </Button>
        </div>

        {/* Assigned Students */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <IconUsers size={18} className="text-[#ff6b35]" />
              <h2 className="font-semibold text-[#1a1f36]">Assigned Students</h2>
            </div>
            {unassigned.length > 0 && (
              <Button onClick={() => setShowAssign(true)} size="sm" variant="outline">
                <IconUserPlus size={14} /> Assign Student
              </Button>
            )}
          </div>

          {students.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No students assigned yet</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {students.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Avatar name={s.user?.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-[#1a1f36]">{s.user?.name}</p>
                      <p className="text-xs text-gray-400">{s.member_id} · Stage {s.stage}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnassignStudent(s.id)}
                    className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assign Student Modal */}
      <Modal open={showAssign} onClose={() => setShowAssign(false)} title="Assign Student to Counselor">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Select an unassigned student to assign to <strong>{counselor.name}</strong>.
          </p>
          <Select
            label="Student"
            value={selectedStudent}
            onChange={e => setSelectedStudent(e.target.value)}
            options={[
              { value: '', label: 'Select a student...' },
              ...unassigned.map(s => ({ value: s.id, label: `${s.user?.name} (${s.member_id})` }))
            ]}
          />
          <Button onClick={handleAssignStudent} loading={assigning} disabled={!selectedStudent} className="w-full">
            Assign
          </Button>
        </div>
      </Modal>
    </div>
  )
}
