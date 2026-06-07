import { useState, useEffect } from 'react'
import { IconPhone, IconBrandWhatsapp, IconVideo, IconFilter } from '@tabler/icons-react'
import { Badge } from '../../components/shared/Badge'
import { Card } from '../../components/shared/Card'
import { toast } from '../../components/shared/Toast'
import { CardSkeleton } from '../../components/shared/Skeleton'
import api from '../../lib/api'

const typeIcon = {
  call: <IconPhone size={16} className="text-blue-500" />,
  whatsapp: <IconBrandWhatsapp size={16} className="text-green-500" />,
  video: <IconVideo size={16} className="text-purple-500" />,
}

const FILTERS = ['All', 'Today', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

export default function CounselorSessions() {
  const [sessions, setSessions] = useState([])
  const [filtered, setFiltered] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [outcomeNote, setOutcomeNote] = useState({})

  useEffect(() => { loadSessions() }, [])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    let result = sessions
    if (filter === 'Today') result = sessions.filter(s => s.date === today)
    else if (filter === 'Pending') result = sessions.filter(s => s.status === 'Pending')
    else if (filter === 'Confirmed') result = sessions.filter(s => s.status === 'Confirmed')
    else if (filter === 'Completed') result = sessions.filter(s => s.status === 'Completed')
    else if (filter === 'Cancelled') result = sessions.filter(s => s.status === 'Cancelled')
    setFiltered(result)
  }, [sessions, filter])

  async function loadSessions() {
    try {
      const res = await api.get('/api/sessions/counselor/mine')
      setSessions(res.data)
    } catch { } finally { setLoading(false) }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/sessions/${id}/status`, { status })
      toast.success(`Session ${status}`)
      loadSessions()
    } catch { toast.error('Failed') }
  }

  const markOutcome = async (id, outcome) => {
    try {
      await api.put(`/api/sessions/${id}/outcome`, { outcome, outcome_note: outcomeNote[id] || '' })
      toast.success('Outcome saved')
      loadSessions()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1a1f36]">Sessions</h1>
        <span className="text-sm text-gray-500">{filtered.length}</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filter === f ? 'bg-[#ff6b35] text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No sessions found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <Card key={s.id}>
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  s.type === 'call' ? 'bg-blue-50' : s.type === 'whatsapp' ? 'bg-green-50' : 'bg-purple-50'
                }`}>
                  {typeIcon[s.type]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-[#1a1f36]">{s.student?.user?.name || s.student?.member_id}</p>
                    <Badge label={s.status} />
                  </div>
                  <p className="text-xs text-gray-500">{s.date} at {s.time}</p>
                  {s.note && <p className="text-xs text-gray-400 italic mt-0.5">{s.note}</p>}
                </div>
                {s.student?.user?.phone && (
                  <div className="flex gap-1">
                    <a href={`tel:${s.student.user.phone}`} className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center">
                      <IconPhone size={13} className="text-blue-500" />
                    </a>
                    <a href={`https://wa.me/${s.student.user.phone}`} target="_blank" rel="noreferrer" className="w-7 h-7 bg-green-50 rounded-full flex items-center justify-center">
                      <IconBrandWhatsapp size={13} className="text-green-500" />
                    </a>
                  </div>
                )}
              </div>

              {s.status === 'Pending' && (
                <div className="flex gap-2 border-t border-gray-100 pt-2">
                  <button onClick={() => updateStatus(s.id, 'Confirmed')} className="flex-1 text-xs bg-green-100 text-green-700 font-semibold py-2 rounded-xl hover:bg-green-200">Confirm</button>
                  <button onClick={() => updateStatus(s.id, 'Rescheduled')} className="flex-1 text-xs bg-amber-100 text-amber-700 font-semibold py-2 rounded-xl hover:bg-amber-200">Reschedule</button>
                  <button onClick={() => updateStatus(s.id, 'Cancelled')} className="flex-1 text-xs bg-red-100 text-red-600 font-semibold py-2 rounded-xl hover:bg-red-200">Decline</button>
                </div>
              )}

              {s.status === 'Confirmed' && !s.outcome && (
                <div className="border-t border-gray-100 pt-2 space-y-2">
                  <input
                    className="input text-xs"
                    placeholder="Outcome note..."
                    value={outcomeNote[s.id] || ''}
                    onChange={e => setOutcomeNote(o => ({ ...o, [s.id]: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    {['Attended', 'NoAnswer', 'Rescheduled'].map(o => (
                      <button key={o} onClick={() => markOutcome(s.id, o)}
                        className="flex-1 text-xs bg-blue-100 text-blue-700 font-semibold py-2 rounded-xl hover:bg-blue-200">
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {s.outcome && (
                <p className="text-xs text-blue-600 border-t border-gray-100 pt-2">
                  Outcome: {s.outcome}{s.outcome_note ? ` — ${s.outcome_note}` : ''}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
