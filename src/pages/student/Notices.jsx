import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconArrowLeft, IconSearch, IconX, IconAlertCircle, IconInfoCircle,
  IconNews, IconBell, IconChevronRight, IconExternalLink
} from '@tabler/icons-react'
import { CardSkeleton } from '../../components/shared/Skeleton'
import api from '../../lib/api'

const TYPE_META = {
  news: {
    label: 'News',
    icon: <IconNews size={14} />,
    badge: 'bg-gray-100 text-gray-600',
    cardBorder: 'border-gray-100',
  },
  urgent: {
    label: 'Urgent',
    icon: <IconAlertCircle size={14} />,
    badge: 'bg-red-100 text-red-600',
    cardBorder: 'border-red-100',
  },
  warning: {
    label: 'Warning',
    icon: <IconAlertCircle size={14} />,
    badge: 'bg-amber-100 text-amber-700',
    cardBorder: 'border-amber-100',
  },
  info: {
    label: 'Info',
    icon: <IconInfoCircle size={14} />,
    badge: 'bg-blue-100 text-blue-600',
    cardBorder: 'border-blue-100',
  },
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'news', label: 'News', icon: <IconNews size={14} /> },
  { key: 'urgent', label: 'Urgent' },
  { key: 'warning', label: 'Warning' },
  { key: 'info', label: 'Info' },
]

function NoticeModal({ notice, onClose }) {
  if (!notice) return null
  const meta = TYPE_META[notice.type] || TYPE_META.info

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-3xl p-6 space-y-4 max-h-[88vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto -mt-1" />

        <div className="flex items-start justify-between gap-3">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <IconNews size={28} className="text-gray-400" />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0"
          >
            <IconX size={16} className="text-gray-600" />
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
              {meta.icon} {meta.label}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(notice.created_at).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric'
              })}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#1a1f36] leading-snug">{notice.title}</h2>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">{notice.message}</p>

        {notice.link && (
          <a
            href={notice.link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#1a1f36] text-white font-semibold py-4 rounded-2xl hover:opacity-90 transition-opacity"
          >
            Go to Link <IconExternalLink size={16} />
          </a>
        )}
      </div>
    </div>
  )
}

export default function StudentNotices() {
  const navigate = useNavigate()
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/api/notifications/announcements')
      .then(r => setNotices(r.data || []))
      .catch(() => setNotices([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = filter === 'all' ? notices : notices.filter(n => n.type === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.message?.toLowerCase().includes(q)
      )
    }
    return list
  }, [notices, filter, search])

  return (
    <div className="pb-4 space-y-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
        >
          <IconArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-[#1a1f36]">All Updates</h1>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <IconSearch size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search updates..."
          className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/30 focus:bg-white border border-transparent focus:border-gray-200 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <IconX size={15} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-0">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              filter === f.key
                ? 'bg-[#1a1f36] text-white border-[#1a1f36]'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            {f.icon && f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3 mt-2">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <IconBell size={28} className="text-gray-300" />
          </div>
          <p className="text-sm">No updates found</p>
        </div>
      ) : (
        <div className="space-y-3 mt-1">
          {filtered.map(n => {
            const meta = TYPE_META[n.type] || TYPE_META.info
            const dateStr = new Date(n.created_at).toISOString().split('T')[0]

            return (
              <button
                key={n.id}
                onClick={() => setSelected(n)}
                className={`w-full text-left bg-white rounded-2xl border ${meta.cardBorder} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
              >
                {/* Badge row */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${meta.badge}`}>
                    {meta.icon} {meta.label}
                  </span>
                  <span className="text-xs text-gray-400">{dateStr}</span>
                </div>

                {/* Content row */}
                <div className="flex items-start gap-3 px-4 pb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <IconNews size={26} className="text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1a1f36] text-sm leading-snug line-clamp-2">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                  </div>
                  <IconChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      <NoticeModal notice={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
