import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconCheck, IconClock, IconDownload, IconChevronRight } from '@tabler/icons-react'
import { Avatar } from '../../components/shared/Avatar'
import { Badge } from '../../components/shared/Badge'
import { Card } from '../../components/shared/Card'
import api from '../../lib/api'

export default function AdminPrefLists() {
  const [students, setStudents] = useState([])
  const [listsMap, setListsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const studRes = await api.get('/api/students')
      setStudents(studRes.data)

      const map = {}
      await Promise.all(studRes.data.map(async s => {
        try {
          const r = await api.get(`/api/preflists/student/${s.id}/active`)
          map[s.id] = r.data
        } catch { map[s.id] = null }
      }))
      setListsMap(map)
    } catch { } finally { setLoading(false) }
  }

  const published = students.filter(s => listsMap[s.id])
  const pending = students.filter(s => !listsMap[s.id])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1a1f36]">All Preference Lists</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-600">{published.length}</p>
          <p className="text-xs text-gray-500 mt-1">Published</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-amber-500">{pending.length}</p>
          <p className="text-xs text-gray-500 mt-1">Pending</p>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1a1f36] text-white text-xs">
                <th className="text-left px-4 py-3">Student</th>
                <th className="text-left px-4 py-3">Counselor</th>
                <th className="text-right px-4 py-3">Entries</th>
                <th className="text-left px-4 py-3">Version</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Published</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const list = listsMap[s.id]
                return (
                  <tr key={s.id} onClick={() => navigate(`/admin/students/${s.id}`)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={s.user?.name} size="sm" />
                        <div>
                          <p className="font-medium text-[#1a1f36]">{s.user?.name}</p>
                          <p className="text-xs text-gray-400">{s.member_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{s.counselor?.name || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold">{list?.entries?.length || '—'}</td>
                    <td className="px-4 py-3 text-xs">{list ? `v${list.version}` : '—'}</td>
                    <td className="px-4 py-3">
                      {list ? (
                        <Badge label="Published" variant="verified" />
                      ) : (
                        <Badge label="Pending" variant="pending" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {list?.published_at ? new Date(list.published_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {list && (
                        <a
                          href={`/api/preflists/${list.id}/export/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-[#ff6b35] hover:text-orange-600"
                        >
                          <IconDownload size={16} />
                        </a>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
