import { useState, useEffect } from 'react'
import { IconClockHour4, IconDownload, IconLock, IconLockOpen, IconExternalLink } from '@tabler/icons-react'
import { PrefListView } from '../../components/student/PrefListView'
import { Card } from '../../components/shared/Card'
import { Badge } from '../../components/shared/Badge'
import { toast } from '../../components/shared/Toast'
import { LoadingScreen } from '../../components/shared/Skeleton'
import api from '../../lib/api'

export default function StudentPrefList() {
  const [list, setList] = useState(null)
  const [listId, setListId] = useState(null)
  const [studentId, setStudentId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const studRes = await api.get('/api/students')
      const me = studRes.data[0]
      setStudentId(me?.id)
      if (me) {
        const listRes = await api.get(`/api/preflists/student/${me.id}/active`)
        setList(listRes.data)
        setListId(listRes.data?.id)
      }
    } catch {
      setList(null)
    } finally {
      setLoading(false)
    }
  }

  const handleReorder = async (newOrder) => {
    setSaving(true)
    try {
      await api.put(`/api/preflists/${listId}/student-reorder`, { order: newOrder })
      toast.success('Order saved! Counselor notified.')
      setList(prev => ({ ...prev, student_order: newOrder }))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save order')
    } finally {
      setSaving(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      const res = await api.get(`/api/preflists/${listId}/export/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `pref_list_v${list.version}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed')
    }
  }

  const handleExportText = () => {
    const entries = list.student_order?.length ? list.student_order : list.entries
    const text = entries.map((e, i) => `${i + 1}. ${e.college_name} - ${e.branch || ''}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pref_list_v${list.version}.txt`
    a.click()
  }

  if (loading) return <LoadingScreen />

  if (!list) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
        <IconClockHour4 size={40} className="text-amber-500" />
      </div>
      <h2 className="text-xl font-bold text-[#1a1f36] mb-2">List Not Ready Yet</h2>
      <p className="text-gray-500 text-sm max-w-xs">
        Your counselor is preparing your personalized preference list. You'll be notified once it's ready!
      </p>
    </div>
  )

  const entries = list.entries || []
  const displayEntries = filter === 'all' ? entries
    : filter === 'govt' ? entries.filter(e => e.type === 'Government')
    : filter === 'aided' ? entries.filter(e => e.type === 'Government Aided')
    : filter === 'pvt' ? entries.filter(e => e.type === 'Unaided')
    : entries.filter(e => e.city?.toLowerCase() === filter.toLowerCase())

  const cities = [...new Set(entries.map(e => e.city).filter(Boolean))]

  return (
    <div className="space-y-4 pb-24">
      {/* Meta banner */}
      <Card className="bg-gradient-to-r from-[#1a1f36] to-[#2d3a6b] text-white" padding="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-lg">{entries.length} Colleges</p>
              <Badge label={`v${list.version}`} className="bg-white/20 text-white" />
              {list.is_locked
                ? <span className="flex items-center gap-1 text-xs text-red-300"><IconLock size={12} />Locked</span>
                : <span className="flex items-center gap-1 text-xs text-green-300"><IconLockOpen size={12} />Editable</span>
              }
            </div>
            <p className="text-blue-200 text-xs">By: {list.uploaded_by} · {new Date(list.published_at).toLocaleDateString('en-IN')}</p>
          </div>
        </div>
        {list.notes && <p className="text-blue-100 text-xs mt-2 border-t border-white/10 pt-2">{list.notes}</p>}
      </Card>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-blue-800 text-xs font-semibold mb-1">How to use this list</p>
        <p className="text-blue-600 text-xs">Enter these colleges in the SAME ORDER on <strong>mahacet.org</strong>. Top 3 choices are highlighted. You can reorder below if not locked.</p>
        {/* <a href="https://mhtcet.mindzspark.in/college-predictor" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-700 font-semibold mt-1 hover:underline">
          Open College Predictor <IconExternalLink size={12} />
        </a> */}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {[{ key: 'all', label: 'All' }, { key: 'govt', label: 'Govt' }, { key: 'aided', label: 'Aided' }, { key: 'pvt', label: 'Private' }, ...cities.map(c => ({ key: c, label: c }))].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
              filter === f.key ? 'bg-[#ff6b35] text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* College list */}
      {saving && <p className="text-xs text-center text-gray-400 animate-pulse">Saving order...</p>}
      <PrefListView list={{ ...list, entries: displayEntries }} onReorder={filter === 'all' && !list.is_locked ? handleReorder : null} />

      {/* Bottom actions */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-white/90 backdrop-blur border-t border-gray-100 flex gap-2 max-w-mobile mx-auto">
        <button onClick={handleExportPDF} className="flex-1 flex items-center justify-center gap-2 bg-[#1a1f36] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-navy-700 transition-colors">
          <IconDownload size={16} /> PDF
        </button>
        <button onClick={handleExportText} className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          <IconDownload size={16} /> Text
        </button>
      </div>
    </div>
  )
}
