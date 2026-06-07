import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconUsers, IconCalendar, IconBell,
  IconPhone, IconBrandWhatsapp, IconClock, IconAlertCircle, IconVideo
} from '@tabler/icons-react'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { StatsGrid } from '../../components/admin/StatsGrid'
import { Badge } from '../../components/shared/Badge'
import { Card } from '../../components/shared/Card'
import api from '../../lib/api'

function PendingSessionCard({ session: s, onDone }) {
  const [meetLink, setMeetLink] = useState('')
  const [showMeet, setShowMeet] = useState(false)

  const confirm = async () => {
    await api.put(`/api/sessions/${s.id}/status`, {
      status: 'Confirmed',
      meet_link: s.type === 'video' ? meetLink : undefined
    })
    onDone()
  }

  return (
    <Card className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="font-semibold text-sm text-[#1a1f36]">{s.student?.user?.name}</p>
          <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
            {s.type === 'video' && <IconVideo size={12} className="text-purple-500" />}
            {s.type} — {s.date} at {s.time}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => s.type === 'video' ? setShowMeet(v => !v) : confirm()}
            className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-200"
          >
            Confirm
          </button>
          <button
            onClick={async () => { await api.put(`/api/sessions/${s.id}/status`, { status: 'Cancelled' }); onDone() }}
            className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-200"
          >
            Decline
          </button>
        </div>
      </div>
      {showMeet && s.type === 'video' && (
        <div className="flex gap-2 pt-1 border-t border-gray-100">
          <input
            value={meetLink}
            onChange={e => setMeetLink(e.target.value)}
            placeholder="Paste Google Meet link (meet.google.com/...)"
            className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-400"
          />
          <button
            onClick={confirm}
            className="text-xs bg-purple-500 text-white px-3 py-2 rounded-xl font-medium hover:bg-purple-600"
          >
            Send
          </button>
        </div>
      )}
    </Card>
  )
}

export default function CounselorDashboard() {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const [students, setStudents] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [studRes, sessRes] = await Promise.all([
        api.get('/api/students'),
        api.get('/api/sessions/counselor/mine')
      ])
      setStudents(studRes.data)
      setSessions(sessRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const today = new Date().toISOString().split('T')[0]
  const todaySessions = sessions.filter(s => s.date === today)
  const pendingSessions = sessions.filter(s => s.status === 'Pending')
  const docsToVerify = students.reduce((acc) => acc, 0)
  const listsPublished = 0

  const stats = [
    { label: 'My Students', value: students.length, icon: IconUsers, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: "Today's Sessions", value: todaySessions.length, icon: IconCalendar, iconBg: 'bg-orange-50', iconColor: 'text-[#ff6b35]' },
    { label: 'Pending Sessions', value: pendingSessions.length, icon: IconClock, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    { label: 'Notifications', value: unreadCount, icon: IconBell, iconBg: 'bg-purple-50', iconColor: 'text-purple-500' },
  ]

  // Action needed: stage stuck, no list uploaded
  const actionNeeded = students.filter(s => !s.stage || s.stage < 2)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1f36]">Good day, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-gray-500 text-sm">Here's your counseling overview.</p>
      </div>

      <StatsGrid stats={stats} />

      {/* Today's sessions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Today's Sessions</h2>
        {todaySessions.length === 0 ? (
          <Card><p className="text-gray-400 text-sm text-center py-4">No sessions scheduled for today</p></Card>
        ) : (
          <div className="space-y-2">
            {todaySessions.map(s => (
              <Card key={s.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-[#1a1f36]">{s.student?.user?.name || s.student?.member_id}</p>
                    <Badge label={s.status} />
                  </div>
                  <p className="text-xs text-gray-500 capitalize">{s.type} at {s.time}</p>
                </div>
                <div className="flex gap-2">
                  {s.student?.user?.phone && (
                    <>
                      <a href={`tel:${s.student.user.phone}`} className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center hover:bg-blue-100">
                        <IconPhone size={15} className="text-blue-500" />
                      </a>
                      <a href={`https://wa.me/${s.student.user.phone}`} target="_blank" rel="noreferrer" className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center hover:bg-green-100">
                        <IconBrandWhatsapp size={15} className="text-green-500" />
                      </a>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Action needed */}
      {actionNeeded.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <IconAlertCircle size={16} className="text-amber-500" /> Action Needed
          </h2>
          <div className="space-y-2">
            {actionNeeded.slice(0, 5).map(s => (
              <Card
                key={s.id}
                onClick={() => navigate(`/counselor/students/${s.id}`)}
                className="flex items-center gap-3"
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm text-[#1a1f36]">{s.user?.name}</p>
                  <p className="text-xs text-amber-600">Stage {s.stage || 0}: Needs attention</p>
                </div>
                <Badge label="Action Needed" variant="warning" />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending sessions */}
      {pendingSessions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Pending Confirmations</h2>
          <div className="space-y-2">
            {pendingSessions.slice(0, 5).map(s => (
              <PendingSessionCard key={s.id} session={s} onDone={loadData} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
