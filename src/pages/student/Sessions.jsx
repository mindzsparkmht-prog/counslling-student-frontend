import { useState, useEffect } from 'react'
import { IconPhone, IconBrandWhatsapp, IconVideo, IconStar, IconCalendarPlus, IconExternalLink } from '@tabler/icons-react'
import { Badge } from '../../components/shared/Badge'
import { Card } from '../../components/shared/Card'
import { ScheduleModal } from '../../components/student/ScheduleModal'
import { toast } from '../../components/shared/Toast'
import { CardSkeleton } from '../../components/shared/Skeleton'
import api from '../../lib/api'

const typeIcon = {
  call: <IconPhone size={16} className="text-blue-500" />,
  whatsapp: <IconBrandWhatsapp size={16} className="text-green-500" />,
  video: <IconVideo size={16} className="text-purple-500" />,
}

export default function StudentSessions() {
  const [sessions, setSessions] = useState([])
  const [studentId, setStudentId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSchedule, setShowSchedule] = useState(false)
  const [ratingSession, setRatingSession] = useState(null)
  const [rating, setRating] = useState(0)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const studRes = await api.get('/api/students')
      const me = studRes.data[0]
      setStudentId(me?.id)
      if (me) {
        const sessRes = await api.get(`/api/sessions/student/${me.id}`)
        setSessions(sessRes.data)
      }
    } catch { } finally { setLoading(false) }
  }

  const handleRate = async (sessionId) => {
    if (!rating) return toast.error('Please select a rating')
    try {
      await api.put(`/api/sessions/${sessionId}/rating`, { rating })
      toast.success('Rating submitted!')
      setRatingSession(null)
      setRating(0)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to rate')
    }
  }

  if (loading) return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  )

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{sessions.length} sessions total</p>
        <button
          onClick={() => setShowSchedule(true)}
          className="flex items-center gap-2 bg-[#ff6b35] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors"
        >
          <IconCalendarPlus size={16} /> Book
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <IconCalendarPlus size={40} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No sessions yet</p>
          <p className="text-xs mt-1">Book your first counseling session</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <Card key={s.id}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  s.type === 'call' ? 'bg-blue-50' : s.type === 'whatsapp' ? 'bg-green-50' : 'bg-purple-50'
                }`}>
                  {typeIcon[s.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[#1a1f36] text-sm capitalize">{s.type} Session</p>
                    <Badge label={s.status} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{s.date} at {s.time}</p>
                  {s.note && <p className="text-xs text-gray-400 mt-1 italic">{s.note}</p>}
                  {/* Google Meet join button for confirmed video sessions */}
                  {s.type === 'video' && s.status === 'Confirmed' && s.meet_link && (
                    <a
                      href={s.meet_link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <IconVideo size={13} /> Join Google Meet
                    </a>
                  )}
                  {s.type === 'video' && s.status === 'Confirmed' && !s.meet_link && (
                    <p className="text-xs text-gray-400 mt-1.5 italic">Meet link will be shared by counselor</p>
                  )}
                  {s.outcome_note && (
                    <div className="mt-2 bg-gray-50 rounded-lg p-2 space-y-1.5">
                      <p className="text-xs text-gray-600"><span className="font-medium">Outcome:</span> {s.outcome} — {s.outcome_note}</p>
                      {s.recording_link && (
                        <a
                          href={s.recording_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-purple-600 font-medium hover:underline"
                        >
                          <IconExternalLink size={12} /> View Session Recording
                        </a>
                      )}
                    </div>
                  )}
                  {s.status === 'Completed' && !s.rating && (
                    ratingSession === s.id ? (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(n => (
                            <button key={n} onClick={() => setRating(n)}>
                              <IconStar size={20} className={n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                            </button>
                          ))}
                        </div>
                        <button onClick={() => handleRate(s.id)} className="text-xs text-[#ff6b35] font-semibold">Submit</button>
                        <button onClick={() => setRatingSession(null)} className="text-xs text-gray-400">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setRatingSession(s.id)} className="text-xs text-[#ff6b35] font-medium mt-1 flex items-center gap-1">
                        <IconStar size={12} /> Rate this session
                      </button>
                    )
                  )}
                  {s.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(n => (
                        <IconStar key={n} size={13} className={n <= s.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ScheduleModal open={showSchedule} onClose={() => setShowSchedule(false)} onBooked={loadData} />
    </div>
  )
}
