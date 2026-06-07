import { useState, useEffect } from 'react'
import {
  IconUsers, IconUserCheck, IconCalendar,
  IconStar, IconTrendingUp
} from '@tabler/icons-react'
import { StatsGrid } from '../../components/admin/StatsGrid'
import { StageFunnel } from '../../components/admin/StageFunnel'
import { Card } from '../../components/shared/Card'
import { Avatar } from '../../components/shared/Avatar'
import api from '../../lib/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [counselors, setCounselors] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [statsRes, cRes, actRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/counselors'),
        api.get('/api/admin/activity?limit=10')
      ])
      setStats(statsRes.data)
      setCounselors(cRes.data)
      setActivity(actRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const kpiStats = stats ? [
    { label: 'Total Students', value: stats.total, icon: IconUsers, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Active', value: stats.active, icon: IconUserCheck, iconBg: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Admitted', value: stats.admitted, icon: IconTrendingUp, iconBg: 'bg-purple-50', iconColor: 'text-purple-500' },
    { label: 'Sessions (7d)', value: stats.sessions_week, icon: IconCalendar, iconBg: 'bg-cyan-50', iconColor: 'text-cyan-500' },
  ] : []

  const actionLabels = {
    LOGIN: 'Logged in',
    STUDENT_CREATED: 'Student created',
    DOC_UPLOAD: 'Document uploaded',
    PREF_PUBLISH: 'Pref list published',
    STAGE_UPDATE: 'Stage updated',
    SESSION_BOOKED: 'Session booked',
    PAYMENT_UPDATE: 'Payment updated',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1f36]">Platform Overview</h1>
        <p className="text-gray-500 text-sm">MindzSpark Counseling Dashboard</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 h-24 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : <StatsGrid stats={kpiStats} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stage Funnel */}
        {stats && <StageFunnel stageCounts={stats.stage_breakdown || []} />}

        {/* Category Mix */}
        {stats?.category_mix && (
          <Card padding="p-5">
            <h3 className="text-sm font-semibold text-[#1a1f36] mb-4">Category Mix</h3>
            <div className="space-y-2">
              {Object.entries(stats.category_mix).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16">{cat}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div className="bg-[#ff6b35] h-full rounded-full" style={{ width: `${(count / stats.total) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-[#1a1f36] w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Counselor performance */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Counselor Performance</h2>
        {/* Mobile cards */}
        <div className="md:hidden space-y-2">
          {counselors.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
              <Avatar name={c.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#1a1f36] text-sm truncate">{c.name}</p>
                <p className="text-xs text-gray-400">{c.member_id} · {c.student_count} students</p>
              </div>
              {c.avg_rating ? (
                <span className="flex items-center gap-1 font-semibold text-amber-500 text-sm">
                  <IconStar size={13} className="fill-amber-400" />{c.avg_rating}
                </span>
              ) : <span className="text-gray-300 text-sm">—</span>}
            </div>
          ))}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Counselor</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Students</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Rating</th>
              </tr>
            </thead>
            <tbody>
              {counselors.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={c.name} size="sm" />
                      <div>
                        <p className="font-medium text-[#1a1f36]">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.member_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#1a1f36]">{c.student_count}</td>
                  <td className="px-4 py-3 text-right">
                    {c.avg_rating ? (
                      <span className="flex items-center justify-end gap-1 font-semibold text-amber-500">
                        <IconStar size={14} className="fill-amber-400" />{c.avg_rating}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Recent Activity</h2>
        <div className="space-y-2">
          {activity.map(a => (
            <div key={a.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-2.5">
              <div className="w-2 h-2 rounded-full bg-[#ff6b35] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{a.actor_id}</span> {actionLabels[a.action] || a.action}
                </p>
              </div>
              <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
