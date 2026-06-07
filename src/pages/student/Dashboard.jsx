import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconPhone, IconBrandWhatsapp, IconCalendarPlus,
  IconClockHour4, IconCheck, IconX, IconChevronRight,
  IconUserCheck, IconAlertCircle, IconInfoCircle, IconTimeline
} from '@tabler/icons-react'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { StageTracker } from '../../components/student/StageTracker'
import { ScheduleModal } from '../../components/student/ScheduleModal'
import { Card } from '../../components/shared/Card'
import { Badge } from '../../components/shared/Badge'
import api from '../../lib/api'

const NOTICE_ICONS = {
  urgent: <IconAlertCircle size={20} className="text-red-500" />,
  warning: <IconAlertCircle size={20} className="text-amber-500" />,
  info: <IconInfoCircle size={20} className="text-blue-500" />,
}

const NOTICE_STYLES = {
  urgent: { bg: 'bg-red-50', border: 'border-red-200', title: 'text-red-800', msg: 'text-red-600' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', title: 'text-amber-800', msg: 'text-amber-600' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-800', msg: 'text-blue-600' },
}

function NoticeModal({ notice, onClose }) {
  if (!notice) return null
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
            {NOTICE_ICONS[notice.type] || NOTICE_ICONS.info}
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <IconX size={16} className="text-gray-600" />
          </button>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1a1f36]">{notice.title}</h2>
          <p className="text-sm text-gray-400 mt-1">
            {new Date(notice.created_at).toISOString().split('T')[0]}
          </p>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{notice.message}</p>
        {notice.link && (
          <a
            href={notice.link}
            target="_blank"
            rel="noreferrer"
            className="block w-full bg-[#1a1f36] text-white text-center font-semibold py-4 rounded-2xl hover:opacity-90 transition-opacity"
          >
            Go to Link ↗
          </a>
        )}
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const { notifications, markRead } = useNotifications()
  const [student, setStudent] = useState(null)
  const [stats, setStats] = useState(null)
  const [activeList, setActiveList] = useState(null)
  const [notices, setNotices] = useState([])
  const [upcomingSession, setUpcomingSession] = useState(null)
  const [nextEvent, setNextEvent] = useState(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState(null)
  const navigate = useNavigate()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [studentsRes, noticesRes, timelineRes] = await Promise.all([
        api.get('/api/students'),
        api.get('/api/notifications/announcements').catch(() => ({ data: [] })),
        api.get('/api/notifications/timeline').catch(() => ({ data: [] }))
      ])
      const me = studentsRes.data[0]
      setStudent(me)
      setNotices(noticesRes.data || [])
      const todayMidnight = new Date(); todayMidnight.setHours(0, 0, 0, 0)
      const upcoming = (timelineRes.data || []).filter(e => !e.is_done && new Date(e.event_date) >= todayMidnight)
      setNextEvent(upcoming[0] || null)

      if (me) {
        const [statsRes, listRes, sessRes] = await Promise.all([
          api.get(`/api/students/${me.id}/stats`),
          api.get(`/api/preflists/student/${me.id}/active`).catch(() => ({ data: null })),
          api.get(`/api/sessions/student/${me.id}`)
        ])
        setStats(statsRes.data)
        setActiveList(listRes.data)
        const upcoming = sessRes.data?.find(s => ['Pending', 'Confirmed'].includes(s.status))
        setUpcomingSession(upcoming || null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const counselor = student?.counselor
  const counselorWaNumber = counselor?.phone?.replace(/\D/g, '').replace(/^0/, '')
  const counselorWaLink = counselorWaNumber
    ? `https://wa.me/${counselorWaNumber.length === 10 ? '91' + counselorWaNumber : counselorWaNumber}`
    : null

  return (
    <div className="pb-4 space-y-4">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-[#1a1f36] to-[#2d3a6b] rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm">{greeting},</p>
            <h1 className="text-xl font-bold mt-0.5">{user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-blue-200 text-xs mt-1">{user?.memberId}</p>
          </div>
          {nextEvent && (() => {
            const diff = Math.max(0, Math.ceil((new Date(nextEvent.event_date) - new Date()) / 86400000))
            return (
              <div className="bg-[#ff6b35]/20 border border-[#ff6b35]/30 rounded-xl px-3 py-2 text-center">
                <p className="text-[#ff6b35] font-bold text-xl">{diff}</p>
                <p className="text-blue-200 text-[10px] leading-tight">days left</p>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Important Notices */}
      {notices.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Important Updates</p>
            <button
              onClick={() => navigate('/student/notices')}
              className="text-xs text-[#ff6b35] font-medium flex items-center gap-0.5"
            >
              View All <IconChevronRight size={13} />
            </button>
          </div>
          <div className="space-y-2">
            {notices.slice(0, 3).map(n => {
              const style = NOTICE_STYLES[n.type] || NOTICE_STYLES.info
              return (
                <button
                  key={n.id}
                  onClick={() => setSelectedNotice(n)}
                  className={`w-full text-left rounded-xl p-3 border flex items-start gap-3 ${style.bg} ${style.border}`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {NOTICE_ICONS[n.type] || NOTICE_ICONS.info}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${style.title}`}>{n.title}</p>
                    <p className={`text-xs mt-0.5 ${style.msg}`}>
                      {new Date(n.created_at).toISOString().split('T')[0]}
                    </p>
                    <p className={`text-xs mt-0.5 line-clamp-1 ${style.msg}`}>{n.message}</p>
                  </div>
                  <IconChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-1" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Stage Tracker */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Your Progress</p>
          <button
            onClick={() => navigate('/student/timeline')}
            className="flex items-center gap-1 text-xs text-[#ff6b35] font-medium"
          >
            <IconTimeline size={13} /> CAP Timeline
          </button>
        </div>
        <StageTracker currentStage={student?.stage || 0} />
      </Card>

      {/* Assigned Counselor */}
      {counselor ? (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <IconUserCheck size={16} className="text-[#ff6b35]" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Your Counselor</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#1a1f36] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              {counselor.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#1a1f36] text-sm">{counselor.name}</p>
              <p className="text-xs text-gray-400">{counselor.member_id}</p>
            </div>
            <div className="flex gap-2">
              {counselor.phone && (
                <a
                  href={`tel:${counselor.phone}`}
                  className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center hover:bg-blue-100"
                >
                  <IconPhone size={17} className="text-blue-500" />
                </a>
              )}
              {counselorWaLink && (
                <a
                  href={counselorWaLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center hover:bg-green-100"
                >
                  <IconBrandWhatsapp size={17} className="text-green-500" />
                </a>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <IconUserCheck size={20} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">No Counselor Assigned Yet</p>
              <p className="text-xs text-gray-400 mt-0.5">Your counselor will be assigned soon</p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Percentile', value: student?.percentile ? `${student.percentile}%ile` : '—', sub: 'MHT-CET' },
          { label: 'CET Score', value: student?.cet_score || '—', sub: 'out of 200' },
          { label: 'Documents', value: stats ? `${stats.docs_done}/${stats.docs_total}` : '—', sub: 'verified' },
          { label: 'Sessions', value: stats?.sessions_count ?? '—', sub: 'total' },
        ].map((s, i) => (
          <Card key={i} className="text-center">
            <p className="text-2xl font-bold text-[#1a1f36]">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            <p className="text-[10px] text-gray-300">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Pref List Status */}
      <div
        onClick={() => navigate('/student/pref-list')}
        className={`rounded-xl p-4 cursor-pointer border-2 transition-all ${
          activeList
            ? 'bg-green-50 border-green-200 hover:border-green-300'
            : 'bg-amber-50 border-amber-200 hover:border-amber-300'
        }`}
      >
        {activeList ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <IconCheck size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800 text-sm">
                {activeList.entries?.length || 0} colleges ready · v{activeList.version}
              </p>
              <p className="text-xs text-green-600">Tap to view and reorder →</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <IconClockHour4 size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Preference List Pending</p>
              <p className="text-xs text-amber-600">Counselor is preparing your list</p>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming session */}
      {upcomingSession && (
        <Card>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Upcoming Session</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <IconPhone size={18} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#1a1f36] text-sm capitalize">{upcomingSession.type} with Counselor</p>
              <p className="text-xs text-gray-500">{upcomingSession.date} at {upcomingSession.time}</p>
            </div>
            <Badge label={upcomingSession.status} />
          </div>
        </Card>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick Actions</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: 'Call',
              icon: IconPhone,
              color: 'bg-blue-50 text-blue-600',
              action: () => counselor?.phone && window.open(`tel:${counselor.phone}`)
            },
            {
              label: 'WhatsApp',
              icon: IconBrandWhatsapp,
              color: 'bg-green-50 text-green-600',
              action: () => counselorWaLink ? window.open(counselorWaLink, '_blank') : null
            },
            {
              label: 'Book Session',
              icon: IconCalendarPlus,
              color: 'bg-orange-50 text-[#ff6b35]',
              action: () => setShowSchedule(true)
            },
          ].map(({ label, icon: Icon, color, action }) => (
            <button key={label} onClick={action} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${color} hover:opacity-80 transition-opacity`}>
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Notifications */}
      {notifications.slice(0, 3).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Recent Updates</p>
          <div className="space-y-2">
            {notifications.slice(0, 3).map(n => (
              <button key={n.id} onClick={() => markRead(n.id)} className={`w-full text-left rounded-xl p-3 border transition-all ${n.is_read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}>
                <p className={`text-sm font-medium ${n.is_read ? 'text-gray-700' : 'text-[#1a1f36]'}`}>{n.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{n.message}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <ScheduleModal open={showSchedule} onClose={() => setShowSchedule(false)} onBooked={loadData} />

      {/* Notice detail modal */}
      <NoticeModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
    </div>
  )
}
