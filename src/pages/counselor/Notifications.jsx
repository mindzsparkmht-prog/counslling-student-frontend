import { useNotifications } from '../../hooks/useNotifications'
import { Badge } from '../../components/shared/Badge'

export default function CounselorNotifications() {
  const { notifications, markRead, markAllRead } = useNotifications()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1a1f36]">Notifications</h1>
        <button onClick={markAllRead} className="text-xs text-[#ff6b35] font-medium">Mark all read</button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No notifications</div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              className={`bg-white rounded-xl border px-4 py-3 cursor-pointer transition-all ${
                n.is_read ? 'border-gray-100' : 'border-blue-100 bg-blue-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm font-semibold ${n.is_read ? 'text-gray-700' : 'text-[#1a1f36]'}`}>{n.title}</p>
                    <Badge label={n.type} />
                  </div>
                  <p className="text-xs text-gray-500">{n.message}</p>
                  <p className="text-xs text-gray-300 mt-1">{new Date(n.created_at).toLocaleString('en-IN')}</p>
                </div>
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
