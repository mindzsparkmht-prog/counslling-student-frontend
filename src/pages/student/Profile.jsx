import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconEdit, IconLogout, IconLock, IconEye, IconEyeOff } from '@tabler/icons-react'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../../components/shared/Avatar'
import { Input, Select } from '../../components/shared/Input'
import { Button } from '../../components/shared/Button'
import { Card } from '../../components/shared/Card'
import { toast } from '../../components/shared/Toast'
import api from '../../lib/api'

const CATEGORIES = ['Open', 'OBC', 'SC', 'ST', 'EWS', 'VJNT', 'SBC', 'SEBC']

export default function StudentProfile() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [showPwdForm, setShowPwdForm] = useState(false)
  const [newPwd, setNewPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const res = await api.get('/api/students')
      const me = res.data[0]
      setStudent(me)
      setForm({
        phone: me?.user?.phone || '',
        dob: me?.dob || '',
        category: me?.category || '',
        caste: me?.caste || '',
        address: me?.address || '',
        city: me?.city || '',
        annual_income: me?.annual_income || '',
        parent_name: me?.parent_name || '',
        parent_phone: me?.parent_phone || '',
        parent_occupation: me?.parent_occupation || '',
        branch_preference: me?.branch_preference || '',
      })
    } catch (err) { toast.error('Failed to load profile') }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/api/students/${student.id}`, { ...form, phone: form.phone })
      toast.success('Profile updated')
      setEditing(false)
      loadData()
    } catch { toast.error('Update failed') } finally { setSaving(false) }
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const completedFields = student ? Object.values({ ...student, ...student.user }).filter(v => v && v !== 'Active').length : 0
  const completion = Math.min(100, Math.round((completedFields / 15) * 100))

  return (
    <div className="space-y-4 pb-20">
      {/* Profile header */}
      <Card className="text-center" padding="py-6 px-4">
        <Avatar name={user?.name} size="xl" className="mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#1a1f36]">{user?.name}</h2>
        <p className="text-gray-400 text-sm">{user?.memberId}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          {student?.category && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">{student.category}</span>}
          {student?.status && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">{student.status}</span>}
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Profile completion</span><span>{completion}%</span>
          </div>
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="bg-[#ff6b35] h-full rounded-full" style={{ width: `${completion}%` }} />
          </div>
        </div>
      </Card>

      {/* Academic Info */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#1a1f36] text-sm">Academic Info</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'CET Score', value: student?.cet_score },
            { label: 'Percentile', value: student?.percentile ? `${student.percentile}%ile` : null },
            { label: 'HSSC Marks', value: student?.hssc_marks },
            { label: 'Branch Pref', value: student?.branch_preference },
          ].map(f => (
            <div key={f.label}>
              <p className="text-xs text-gray-400">{f.label}</p>
              <p className="text-sm font-semibold text-[#1a1f36] mt-0.5">{f.value || '—'}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Personal Info */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#1a1f36] text-sm">Personal Info</h3>
          <button onClick={() => setEditing(!editing)} className="text-[#ff6b35] flex items-center gap-1 text-xs font-medium">
            <IconEdit size={14} />{editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Input label="Date of Birth" type="text" placeholder="15 Aug 2006" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
            <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Select</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </Select>
            <Input label="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            <Input label="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            <Input label="Annual Income" value={form.annual_income} onChange={e => setForm(f => ({ ...f, annual_income: e.target.value }))} />
            <h4 className="text-sm font-semibold text-gray-700 mt-2">Parent Info</h4>
            <Input label="Parent Name" value={form.parent_name} onChange={e => setForm(f => ({ ...f, parent_name: e.target.value }))} />
            <Input label="Parent Phone" value={form.parent_phone} onChange={e => setForm(f => ({ ...f, parent_phone: e.target.value }))} />
            <Button onClick={handleSave} loading={saving} className="w-full">Save Changes</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Phone', value: student?.user?.phone },
              { label: 'Date of Birth', value: student?.dob },
              { label: 'Category', value: student?.category },
              { label: 'City', value: student?.city },
              { label: 'Annual Income', value: student?.annual_income },
              { label: 'Parent Name', value: student?.parent_name },
              { label: 'Parent Phone', value: student?.parent_phone },
            ].map(f => (
              <div key={f.label}>
                <p className="text-xs text-gray-400">{f.label}</p>
                <p className="text-sm font-semibold text-[#1a1f36] mt-0.5">{f.value || '—'}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Change Password */}
      <Card>
        <div className="flex items-center justify-between" onClick={() => setShowPwdForm(!showPwdForm)}>
          <div className="flex items-center gap-2">
            <IconLock size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Change Password</span>
          </div>
          <span className="text-xs text-[#ff6b35]">{showPwdForm ? 'Cancel' : 'Update'}</span>
        </div>
        {showPwdForm && (
          <div className="mt-3 space-y-3">
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className="input pr-10"
                placeholder="New password (min 8 chars)"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPwd ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
            <Button
              onClick={async () => {
                if (newPwd.length < 8) return toast.error('Min 8 characters')
                try {
                  // Use Supabase directly for password update
                  const { supabase } = await import('../../lib/supabase')
                  await supabase.auth.updateUser({ password: newPwd })
                  toast.success('Password updated')
                  setShowPwdForm(false)
                  setNewPwd('')
                } catch { toast.error('Failed to update password') }
              }}
              className="w-full"
            >
              Update Password
            </Button>
          </div>
        )}
      </Card>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 text-red-500 border border-red-200 rounded-xl py-3 font-semibold text-sm hover:bg-red-50 transition-colors"
      >
        <IconLogout size={18} /> Sign Out
      </button>
    </div>
  )
}
