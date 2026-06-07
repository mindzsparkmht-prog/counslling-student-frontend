import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  IconArrowLeft, IconPhone, IconBrandWhatsapp, IconUpload,
  IconCheck, IconX, IconSend, IconDownload, IconLock, IconLockOpen,
  IconExternalLink, IconUserCheck, IconVideo
} from '@tabler/icons-react'
import { Avatar } from '../../components/shared/Avatar'
import { Badge } from '../../components/shared/Badge'
import { Card } from '../../components/shared/Card'
import { Button } from '../../components/shared/Button'
import { Input, Select, Textarea } from '../../components/shared/Input'
import { PrefListEditor } from '../../components/counselor/PrefListEditor'
import { toast } from '../../components/shared/Toast'
import { LoadingScreen } from '../../components/shared/Skeleton'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'

const STAGES = [
  { value: 0, label: 'Registration' },
  { value: 1, label: 'Documents' },
  { value: 2, label: 'Pref List' },
  { value: 3, label: 'CAP Round 1' },
  { value: 4, label: 'Seat Acceptance' },
  { value: 5, label: 'Admitted' },
]

const DOC_STATUSES = ['Pending', 'Submitted', 'Verified', 'Rejected']

export default function CounselorStudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentUser = useAuthStore(s => s.user)
  const isAdmin = currentUser?.role === 'admin'
  const [student, setStudent] = useState(null)
  const [docs, setDocs] = useState([])
  const [lists, setLists] = useState([])
  const [sessions, setSessions] = useState([])
  const [notes, setNotes] = useState([])
  const [counselors, setCounselors] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [assigningCounselor, setAssigningCounselor] = useState(false)
  const [activeList, setActiveList] = useState(null)
  const [activeListId, setActiveListId] = useState(null)
  const [entries, setEntries] = useState([])
  const [draftSaving, setDraftSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [notePrivate, setNotePrivate] = useState(false)
  const [docRemark, setDocRemark] = useState({})
  const [sessionOutcome, setSessionOutcome] = useState({})
  const [meetLinks, setMeetLinks] = useState({})
  const [recordingLinks, setRecordingLinks] = useState({})
  const [newCustomStage, setNewCustomStage] = useState('')
  const [addingStage, setAddingStage] = useState(false)

  useEffect(() => { loadAll() }, [id])

  async function loadAll() {
    try {
      const requests = [
        api.get(`/api/students/${id}`),
        api.get(`/api/documents/student/${id}`),
        api.get(`/api/preflists/student/${id}`),
        api.get(`/api/sessions/student/${id}`)
      ]
      if (isAdmin) requests.push(api.get('/api/counselors'))
      const [studRes, docsRes, listsRes, sessRes, cRes] = await Promise.all(requests)
      setStudent(studRes.data)
      if (cRes) setCounselors(cRes.data || [])
      setDocs(docsRes.data)
      setLists(listsRes.data)
      setSessions(sessRes.data)

      const latest = listsRes.data[0]
      if (latest) {
        setActiveList(latest)
        setActiveListId(latest.id)
        setEntries(latest.entries || [])
      }
    } catch (err) { toast.error('Failed to load student') }
    finally { setLoading(false) }
  }

  const handleDocStatus = async (docId, status, remarks) => {
    try {
      await api.put(`/api/documents/${docId}/status`, { status, remarks: remarks || '' })
      toast.success(`Document ${status}`)
      loadAll()
    } catch { toast.error('Failed to update document') }
  }

  const handleStageUpdate = async (stage) => {
    try {
      await api.put(`/api/students/${id}/stage`, { stage })
      toast.success(`Stage updated to: ${STAGES[stage].label}`)
      setStudent(s => ({ ...s, stage }))
    } catch { toast.error('Stage update failed') }
  }

  const handleUploadFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post(`/api/preflists/student/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setEntries(res.data.entries)
      setActiveList(null)
      setActiveListId(null)
      toast.success(`Extracted ${res.data.entries.length} entries. Review and save.`)
    } catch (err) { toast.error(err.response?.data?.error || 'Upload failed') }
    finally { setUploading(false) }
  }

  const handleSaveDraft = async () => {
    setDraftSaving(true)
    try {
      if (activeListId) {
        await api.put(`/api/preflists/${activeListId}`, { entries })
        toast.success('Draft saved')
      } else {
        const res = await api.post(`/api/preflists/student/${id}`, { entries, source_type: 'manual', notes: '' })
        setActiveListId(res.data.id)
        setActiveList(res.data)
        toast.success('Draft saved as new version')
      }
      loadAll()
    } catch { toast.error('Save failed') } finally { setDraftSaving(false) }
  }

  const handlePublish = async () => {
    if (!activeListId) return toast.error('Save draft first')
    if (!entries.length) return toast.error('List is empty')
    setPublishing(true)
    try {
      await api.put(`/api/preflists/${activeListId}/publish`)
      toast.success('List published to student!')
      loadAll()
    } catch { toast.error('Publish failed') } finally { setPublishing(false) }
  }

  const handleToggleLock = async () => {
    try {
      await api.put(`/api/preflists/${activeListId}/lock`)
      toast.success('Lock status toggled')
      loadAll()
    } catch { toast.error('Failed') }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    try {
      await api.post('/api/admin/notes', { student_id: id, text: newNote, is_private: notePrivate })
      toast.success('Note added')
      setNewNote('')
      // Reload notes
      const res = await api.get(`/api/admin/notes/student/${id}`)
      setNotes(res.data)
    } catch { toast.error('Failed to add note') }
  }

  const handleOutcome = async (sessId, outcome, note) => {
    try {
      await api.put(`/api/sessions/${sessId}/outcome`, {
        outcome,
        outcome_note: note,
        recording_link: recordingLinks[sessId] || null
      })
      toast.success('Outcome saved')
      loadAll()
    } catch { toast.error('Failed') }
  }

  const handleAddCustomStage = async () => {
    const label = newCustomStage.trim()
    if (!label) return
    setAddingStage(true)
    try {
      const current = student.custom_stages || []
      const updated = [...current, { label, done: false, created_at: new Date().toISOString() }]
      await api.put(`/api/students/${id}`, { custom_stages: updated })
      setStudent(s => ({ ...s, custom_stages: updated }))
      setNewCustomStage('')
      toast.success('Stage added')
    } catch (err) { toast.error(err.response?.data?.error || err.message || 'Failed to add stage') }
    finally { setAddingStage(false) }
  }

  const handleToggleCustomStage = async (idx) => {
    try {
      const updated = (student.custom_stages || []).map((s, i) =>
        i === idx ? { ...s, done: !s.done } : s
      )
      await api.put(`/api/students/${id}`, { custom_stages: updated })
      setStudent(s => ({ ...s, custom_stages: updated }))
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const handleDeleteCustomStage = async (idx) => {
    try {
      const updated = (student.custom_stages || []).filter((_, i) => i !== idx)
      await api.put(`/api/students/${id}`, { custom_stages: updated })
      setStudent(s => ({ ...s, custom_stages: updated }))
      toast.success('Stage removed')
    } catch { toast.error('Failed') }
  }

  const handleAssignCounselor = async (counselorId) => {
    setAssigningCounselor(true)
    try {
      await api.put(`/api/students/${id}/counselor`, { counselor_id: counselorId || null })
      toast.success(counselorId ? 'Counselor assigned' : 'Counselor removed')
      loadAll()
    } catch { toast.error('Failed to assign counselor') }
    finally { setAssigningCounselor(false) }
  }

  if (loading) return <LoadingScreen />
  if (!student) return <div className="text-center py-12 text-gray-400">Student not found</div>

  const tabs = ['overview', 'documents', 'pref-list', 'sessions', 'notes']

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <IconArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <Avatar name={student.user?.name} />
          <div>
            <h1 className="font-bold text-[#1a1f36] text-lg">{student.user?.name}</h1>
            <p className="text-sm text-gray-400">{student.member_id} · {student.category}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {student.user?.phone && (
            <>
              <a href={`tel:${student.user.phone}`} className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center hover:bg-blue-100">
                <IconPhone size={17} className="text-blue-500" />
              </a>
              <a href={`https://wa.me/${student.user.phone}`} target="_blank" rel="noreferrer" className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center hover:bg-green-100">
                <IconBrandWhatsapp size={17} className="text-green-500" />
              </a>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto bg-gray-100 rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
              tab === t ? 'bg-white text-[#1a1f36] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Stage buttons */}
          <Card>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Update Stage</p>
            <div className="grid grid-cols-3 gap-2">
              {STAGES.map(s => (
                <button
                  key={s.value}
                  onClick={() => handleStageUpdate(s.value)}
                  className={`text-xs font-semibold py-2 px-2 rounded-xl border transition-colors ${
                    student.stage === s.value
                      ? 'bg-[#ff6b35] text-white border-[#ff6b35]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#ff6b35]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Custom stages */}
          <Card>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Custom Stages</p>
            <div className="space-y-2 mb-3">
              {(student.custom_stages || []).length === 0 && (
                <p className="text-xs text-gray-400">No custom stages yet. Add milestones specific to this student.</p>
              )}
              {(student.custom_stages || []).map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleCustomStage(i)}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      s.done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}
                  >
                    {s.done && <IconCheck size={11} className="text-white" />}
                  </button>
                  <span className={`flex-1 text-sm ${s.done ? 'line-through text-gray-400' : 'text-[#1a1f36]'}`}>
                    {s.label}
                  </span>
                  <button
                    onClick={() => handleDeleteCustomStage(i)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#ff6b35]"
                placeholder="Add custom stage (e.g. Documents complete, Round 2 prep...)"
                value={newCustomStage}
                onChange={e => setNewCustomStage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCustomStage()}
              />
              <button
                onClick={handleAddCustomStage}
                disabled={addingStage || !newCustomStage.trim()}
                className="text-xs bg-[#ff6b35] text-white px-3 py-2 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </Card>

          {/* Admin: Assign Counselor */}
          {isAdmin && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <IconUserCheck size={16} className="text-[#ff6b35]" />
                <p className="text-xs font-semibold text-gray-500 uppercase">Assigned Counselor</p>
              </div>
              {student.counselor ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={student.counselor?.name} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-[#1a1f36]">{student.counselor?.name}</p>
                      <p className="text-xs text-gray-400">{student.counselor?.member_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssignCounselor(null)}
                    disabled={assigningCounselor}
                    className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-2">No counselor assigned</p>
              )}
              <select
                className="input mt-3 text-sm"
                defaultValue=""
                onChange={e => { if (e.target.value) handleAssignCounselor(e.target.value) }}
                disabled={assigningCounselor}
              >
                <option value="">Change counselor...</option>
                {counselors.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.member_id}) — {c.student_count} students
                  </option>
                ))}
              </select>
            </Card>
          )}

          {/* Info grid */}
          <Card>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'CET Score', value: student.cet_score },
                { label: 'Percentile', value: student.percentile ? `${student.percentile}%ile` : null },
                { label: 'HSSC Marks', value: student.hssc_marks },
                { label: 'Category', value: student.category },
                { label: 'Phone', value: student.user?.phone },
                { label: 'City', value: student.city },
                { label: 'Branch Pref', value: student.branch_preference },
                { label: 'Payment', value: student.payment_status },
                { label: 'Parent', value: student.parent_name },
                { label: 'Parent Phone', value: student.parent_phone },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-xs text-gray-400">{f.label}</p>
                  <p className="text-sm font-semibold text-[#1a1f36] mt-0.5">{f.value || '—'}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* DOCUMENTS TAB */}
      {tab === 'documents' && (
        <div className="space-y-3">
          {docs.map(doc => (
            <Card key={doc.id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm text-[#1a1f36]">{doc.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge label={doc.status} />
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">View file</a>
                    )}
                  </div>
                </div>
              </div>
              {doc.status !== 'Verified' && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleDocStatus(doc.id, 'Verified', '')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold py-2 rounded-xl hover:bg-green-200"
                  >
                    <IconCheck size={13} /> Verify
                  </button>
                  <div className="flex-1 flex gap-1">
                    <input
                      className="flex-1 text-xs border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none"
                      placeholder="Rejection reason..."
                      value={docRemark[doc.id] || ''}
                      onChange={e => setDocRemark(d => ({ ...d, [doc.id]: e.target.value }))}
                    />
                    <button
                      onClick={() => handleDocStatus(doc.id, 'Rejected', docRemark[doc.id])}
                      className="px-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                    >
                      <IconX size={13} />
                    </button>
                  </div>
                </div>
              )}
              {doc.remarks && <p className="text-xs text-red-500 mt-1">Remark: {doc.remarks}</p>}
            </Card>
          ))}
        </div>
      )}

      {/* PREF LIST TAB */}
      {tab === 'pref-list' && (
        <div className="space-y-4">
          {/* Version history */}
          {lists.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {lists.map(l => (
                <button
                  key={l.id}
                  onClick={() => { setActiveList(l); setActiveListId(l.id); setEntries(l.entries || []) }}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    activeListId === l.id ? 'bg-[#1a1f36] text-white border-[#1a1f36]' : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  v{l.version} {l.is_published ? '✓' : ''}
                </button>
              ))}
            </div>
          )}

          {/* Upload section */}
          <Card>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Upload PDF/Excel/CSV</p>
            <label className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#ff6b35] hover:bg-orange-50 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <IconUpload size={24} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Drop file or click to upload</p>
              <p className="text-xs text-gray-400 mt-1">PDF, XLSX, CSV accepted</p>
              <input type="file" className="hidden" accept=".pdf,.xlsx,.xls,.csv" onChange={handleUploadFile} />
            </label>
            {uploading && <p className="text-xs text-center text-[#ff6b35] mt-2 animate-pulse">Extracting data...</p>}
          </Card>

          {/* External predictor link */}
          <a href="https://mhtcet.mindzspark.in/college-predictor" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:underline">
            <IconExternalLink size={16} /> Open College Predictor Tool
          </a>

          {/* Editable table */}
          {entries.length > 0 && (
            <Card padding="p-0" className="overflow-hidden">
              <PrefListEditor entries={entries} onChange={setEntries} />
            </Card>
          )}

          {/* Actions */}
          {entries.length > 0 && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleSaveDraft} loading={draftSaving} className="flex-1">
                Save Draft
              </Button>
              <Button
                variant="primary"
                onClick={handlePublish}
                loading={publishing}
                className="flex-1"
                disabled={activeList?.is_published}
              >
                {activeList?.is_published ? 'Published ✓' : 'Publish to Student'}
              </Button>
            </div>
          )}

          {activeListId && (
            <div className="flex gap-2">
              <button onClick={handleToggleLock} className="flex-1 flex items-center justify-center gap-2 text-xs border border-gray-200 rounded-xl py-2 font-medium hover:bg-gray-50">
                {activeList?.is_locked ? <><IconLockOpen size={14} /> Unlock</> : <><IconLock size={14} /> Lock</>}
              </button>
              <a href={`/api/preflists/${activeListId}/export/pdf`} target="_blank" rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 text-xs bg-[#1a1f36] text-white rounded-xl py-2 font-medium hover:opacity-90">
                <IconDownload size={14} /> Export PDF
              </a>
            </div>
          )}
        </div>
      )}

      {/* SESSIONS TAB */}
      {tab === 'sessions' && (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No sessions yet</p>
          ) : sessions.map(s => (
            <Card key={s.id}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm text-[#1a1f36] capitalize">{s.type} Session</p>
                  <p className="text-xs text-gray-500">{s.date} at {s.time}</p>
                </div>
                <Badge label={s.status} />
              </div>
              {s.note && <p className="text-xs text-gray-400 italic mb-2">{s.note}</p>}

              {/* Pending — confirm with optional meet link for video */}
              {s.status === 'Pending' && (
                <div className="space-y-2 border-t border-gray-100 pt-2">
                  {s.type === 'video' && (
                    <input
                      className="input text-xs"
                      placeholder="Google Meet link (optional, meet.google.com/...)"
                      value={meetLinks[s.id] || ''}
                      onChange={e => setMeetLinks(m => ({ ...m, [s.id]: e.target.value }))}
                    />
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await api.put(`/api/sessions/${s.id}/status`, {
                          status: 'Confirmed',
                          meet_link: s.type === 'video' ? (meetLinks[s.id] || '') : undefined
                        })
                        toast.success('Session confirmed')
                        loadAll()
                      }}
                      className="flex-1 text-xs bg-green-100 text-green-700 py-2 rounded-xl font-semibold hover:bg-green-200"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={async () => {
                        await api.put(`/api/sessions/${s.id}/status`, { status: 'Cancelled' })
                        loadAll()
                      }}
                      className="flex-1 text-xs bg-red-100 text-red-600 py-2 rounded-xl font-semibold hover:bg-red-200"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmed video — show meet link */}
              {s.status === 'Confirmed' && s.type === 'video' && (
                <div className="border-t border-gray-100 pt-2">
                  {s.meet_link ? (
                    <a href={s.meet_link} target="_blank" rel="noreferrer"
                      className="text-xs text-purple-600 font-medium flex items-center gap-1 hover:underline">
                      <IconVideo size={13} /> {s.meet_link}
                    </a>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        className="flex-1 input text-xs"
                        placeholder="Add Google Meet link..."
                        value={meetLinks[s.id] || ''}
                        onChange={e => setMeetLinks(m => ({ ...m, [s.id]: e.target.value }))}
                      />
                      <button
                        onClick={async () => {
                          await api.put(`/api/sessions/${s.id}/status`, { status: 'Confirmed', meet_link: meetLinks[s.id] })
                          toast.success('Meet link saved')
                          loadAll()
                        }}
                        className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-xl font-medium hover:bg-purple-200"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              )}

              {s.status === 'Confirmed' && !s.outcome && (
                <div className="space-y-2 border-t border-gray-100 pt-2 mt-2">
                  <p className="text-xs font-medium text-gray-600">Mark Outcome:</p>
                  <div className="flex gap-2 flex-wrap">
                    {['Attended', 'NoAnswer', 'Rescheduled', 'Cancelled'].map(o => (
                      <button key={o} onClick={() => handleOutcome(s.id, o, sessionOutcome[s.id] || '')}
                        className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#ff6b35] hover:text-[#ff6b35] font-medium transition-colors">
                        {o}
                      </button>
                    ))}
                  </div>
                  <input
                    className="input text-xs"
                    placeholder="Outcome note..."
                    value={sessionOutcome[s.id] || ''}
                    onChange={e => setSessionOutcome(o => ({ ...o, [s.id]: e.target.value }))}
                  />
                  <input
                    className="input text-xs"
                    placeholder="Recording link (Google Drive / YouTube) — optional"
                    value={recordingLinks[s.id] || ''}
                    onChange={e => setRecordingLinks(r => ({ ...r, [s.id]: e.target.value }))}
                  />
                  <p className="text-[10px] text-gray-400">Paste a shareable link to the call/meeting recording. No file upload — saves storage.</p>
                </div>
              )}
              {s.outcome && (
                <div className="border-t border-gray-100 pt-2 mt-1 space-y-1">
                  <p className="text-xs text-blue-600">Outcome: {s.outcome} — {s.outcome_note}</p>
                  {s.recording_link && (
                    <a href={s.recording_link} target="_blank" rel="noreferrer"
                      className="text-xs text-purple-600 font-medium hover:underline flex items-center gap-1">
                      <IconExternalLink size={12} /> View Recording
                    </a>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* NOTES TAB */}
      {tab === 'notes' && (
        <div className="space-y-3">
          <Card>
            <Textarea
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Add a note about this student..."
              rows={3}
            />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={notePrivate} onChange={e => setNotePrivate(e.target.checked)} />
                Private (counselors only)
              </label>
              <Button size="sm" onClick={handleAddNote}>
                <IconSend size={13} /> Add Note
              </Button>
            </div>
          </Card>
          {notes.map(n => (
            <Card key={n.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">{n.created_by} · {new Date(n.created_at).toLocaleDateString('en-IN')}</span>
                {n.is_private && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Private</span>}
              </div>
              <p className="text-sm text-gray-700">{n.text}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
