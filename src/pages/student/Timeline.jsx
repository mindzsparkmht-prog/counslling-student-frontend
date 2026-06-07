import { useState, useEffect } from 'react'
import {
  IconCheck, IconCircle, IconCalendarEvent, IconClock,
  IconX, IconAlertCircle, IconInfoCircle, IconNote,
  IconListCheck, IconExternalLink, IconChevronRight
} from '@tabler/icons-react'
import { CardSkeleton } from '../../components/shared/Skeleton'
import api from '../../lib/api'

function EventModal({ event, onClose }) {
  if (!event) return null

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const eventDate = new Date(event.event_date)
  const isPast = event.is_done || eventDate < today
  const isNext = !isPast && !event.is_done
  const diff = Math.ceil((eventDate - today) / 86400000)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* drag handle */}
        <div className="sticky top-0 bg-white pt-3 pb-2 px-6 border-b border-gray-100 flex items-center justify-between">
          <div className="w-10 h-1 bg-gray-200 rounded-full absolute left-1/2 -translate-x-1/2 top-2" />
          <div />
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-2">
            <IconX size={15} className="text-gray-600" />
          </button>
        </div>

        <div className="px-6 pb-8 space-y-5 pt-4">
          {/* Title + date */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {isPast && (
                <span className="text-[11px] font-bold uppercase bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Completed</span>
              )}
              {!isPast && isNext && (
                <span className="text-[11px] font-bold uppercase bg-[#ff6b35] text-white px-2.5 py-1 rounded-full">Next Event</span>
              )}
              {!isPast && !isNext && (
                <span className="text-[11px] font-bold uppercase bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">Upcoming</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[#1a1f36] leading-snug">{event.event_name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <IconCalendarEvent size={16} className="text-[#ff6b35]" />
              <p className="text-sm text-gray-600 font-medium">
                {eventDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            {!isPast && (
              <div className="mt-2 inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
                <IconClock size={13} className="text-[#ff6b35]" />
                <span className="text-xs text-[#ff6b35] font-semibold">
                  {diff === 0 ? 'Today!' : diff === 1 ? 'Tomorrow' : `In ${diff} days`}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Important Message */}
          {event.important_message && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <IconAlertCircle size={16} className="text-amber-600" />
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Important</p>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed">{event.important_message}</p>
            </div>
          )}

          {/* Alert */}
          {event.alert_message && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <IconAlertCircle size={16} className="text-red-500" />
                <p className="text-xs font-bold text-red-600 uppercase tracking-wide">Alert</p>
              </div>
              <p className="text-sm text-red-700 leading-relaxed">{event.alert_message}</p>
            </div>
          )}

          {/* Changes */}
          {event.changes && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <IconListCheck size={16} className="text-blue-500" />
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">What Changed</p>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-line">{event.changes}</p>
            </div>
          )}

          {/* Notes */}
          {event.notes && (
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <IconNote size={15} className="text-gray-400" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Notes</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{event.notes}</p>
            </div>
          )}

          {/* Link */}
          {event.link && (
            <a
              href={event.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#1a1f36] text-white font-semibold py-4 rounded-2xl hover:opacity-90 transition-opacity"
            >
              Go to Official Link <IconExternalLink size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StudentTimeline() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/api/notifications/timeline')
      .then(r => setEvents(r.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = events.filter(e => !e.is_done && new Date(e.event_date) >= today)
  const nextEvent = upcoming[0]

  return (
    <div className="pb-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1f36]">CAP Timeline</h1>
        <p className="text-sm text-gray-400 mt-0.5">Track all important counselling dates</p>
      </div>

      {/* Next event highlight */}
      {!loading && nextEvent && (
        <button
          onClick={() => setSelected(nextEvent)}
          className="w-full text-left bg-gradient-to-r from-[#1a1f36] to-[#2d3a6b] rounded-2xl p-5 text-white hover:opacity-95 transition-opacity"
        >
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-2">Next Event</p>
          <h2 className="text-lg font-bold">{nextEvent.event_name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <IconCalendarEvent size={15} className="text-[#ff6b35]" />
            <p className="text-sm text-blue-200">
              {new Date(nextEvent.event_date).toLocaleDateString('en-IN', {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
              })}
            </p>
          </div>
          {nextEvent.description && (
            <p className="text-xs text-blue-300 mt-2 leading-relaxed line-clamp-2">{nextEvent.description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            {(() => {
              const diff = Math.ceil((new Date(nextEvent.event_date) - today) / 86400000)
              return (
                <div className="inline-flex items-center gap-1.5 bg-[#ff6b35]/20 border border-[#ff6b35]/30 rounded-full px-3 py-1">
                  <IconClock size={13} className="text-[#ff6b35]" />
                  <span className="text-xs text-[#ff6b35] font-semibold">
                    {diff === 0 ? 'Today!' : diff === 1 ? 'Tomorrow' : `In ${diff} days`}
                  </span>
                </div>
              )
            })()}
            <span className="text-xs text-blue-300 flex items-center gap-1">
              Tap for details <IconChevronRight size={13} />
            </span>
          </div>
        </button>
      )}

      {/* Timeline list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-3">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <IconCalendarEvent size={28} className="text-gray-300" />
          </div>
          <p className="text-sm">No timeline events added yet</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-gray-200 z-0" />
          <div className="space-y-0">
            {events.map(event => {
              const eventDate = new Date(event.event_date)
              const isPast = event.is_done || eventDate < today
              const isNext = !event.is_done && event === nextEvent
              const hasExtra = event.important_message || event.alert_message || event.changes || event.notes || event.link

              return (
                <button
                  key={event.id}
                  onClick={() => setSelected(event)}
                  className="relative flex gap-4 pb-6 last:pb-0 w-full text-left"
                >
                  {/* Circle */}
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                    isPast ? 'bg-green-500 border-green-500'
                    : isNext ? 'bg-[#ff6b35] border-[#ff6b35]'
                    : 'bg-white border-gray-300'
                  }`}>
                    {isPast
                      ? <IconCheck size={18} className="text-white" />
                      : <IconCircle size={14} className={isNext ? 'text-white fill-white' : 'text-gray-300 fill-gray-100'} />
                    }
                  </div>

                  {/* Card */}
                  <div className={`flex-1 rounded-2xl border p-4 hover:shadow-sm transition-shadow ${
                    isPast ? 'bg-gray-50 border-gray-100'
                    : isNext ? 'bg-orange-50 border-orange-200 shadow-sm'
                    : 'bg-white border-gray-100'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold text-sm leading-tight ${isPast ? 'text-gray-400' : 'text-[#1a1f36]'}`}>
                        {event.event_name}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {hasExtra && (
                          <IconInfoCircle size={14} className={isPast ? 'text-gray-300' : 'text-blue-400'} />
                        )}
                        {isNext && <span className="text-[10px] font-bold uppercase bg-[#ff6b35] text-white px-2 py-0.5 rounded-full">Next</span>}
                        {isPast && <span className="text-[10px] font-semibold uppercase bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Done</span>}
                      </div>
                    </div>
                    <p className={`text-xs mt-1 ${isPast ? 'text-gray-400' : 'text-gray-500'}`}>
                      {eventDate.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    {event.description && (
                      <p className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${isPast ? 'text-gray-400' : 'text-gray-600'}`}>
                        {event.description}
                      </p>
                    )}
                    {event.alert_message && (
                      <div className="flex items-center gap-1 mt-2">
                        <IconAlertCircle size={12} className="text-red-400" />
                        <p className="text-[11px] text-red-500 font-medium line-clamp-1">{event.alert_message}</p>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <EventModal event={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
