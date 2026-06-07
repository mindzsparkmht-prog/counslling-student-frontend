import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconCheck, IconClock, IconChevronRight } from '@tabler/icons-react'
import { Badge } from '../../components/shared/Badge'
import { Card } from '../../components/shared/Card'
import { Avatar } from '../../components/shared/Avatar'
import { CardSkeleton } from '../../components/shared/Skeleton'
import api from '../../lib/api'

export default function CounselorPrefLists() {
  const [students, setStudents] = useState([])
  const [listsMap, setListsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const studRes = await api.get('/api/students')
      setStudents(studRes.data)

      const listData = {}
      await Promise.all(
        studRes.data.map(async (s) => {
          try {
            const r = await api.get(`/api/preflists/student/${s.id}/active`)
            listData[s.id] = r.data
          } catch { listData[s.id] = null }
        })
      )
      setListsMap(listData)
    } catch { } finally { setLoading(false) }
  }

  const published = students.filter(s => listsMap[s.id]?.is_published)
  const pending = students.filter(s => !listsMap[s.id]?.is_published)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1a1f36]">Preference Lists</h1>
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
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : (
        <div className="space-y-3">
          {students.map(s => {
            const list = listsMap[s.id]
            return (
              <Card
                key={s.id}
                onClick={() => navigate(`/counselor/students/${s.id}`)}
                className="flex items-center gap-3"
              >
                <Avatar name={s.user?.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1a1f36] text-sm">{s.user?.name}</p>
                  <p className="text-xs text-gray-400">{s.member_id}</p>
                  {list ? (
                    <p className="text-xs text-green-600 mt-0.5">
                      <IconCheck size={11} className="inline mr-0.5" />
                      v{list.version} · {list.entries?.length || 0} entries · {new Date(list.published_at).toLocaleDateString('en-IN')}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-500 mt-0.5">
                      <IconClock size={11} className="inline mr-0.5" />No list yet
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {list?.is_published ? (
                    <Badge label="Published" variant="verified" />
                  ) : list ? (
                    <Badge label="Draft" variant="pending" />
                  ) : null}
                  <IconChevronRight size={16} className="text-gray-300" />
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
