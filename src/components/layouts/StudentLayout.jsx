import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  IconHome, IconFiles, IconListNumbers, IconTimeline, IconBell, IconCalendar
} from '@tabler/icons-react'
import { useNotifications } from '../../hooks/useNotifications'
import { useAuth } from '../../hooks/useAuth'

const NAV_ITEMS = [
  { to: '/student/home', icon: IconHome, label: 'Home' },
  { to: '/student/documents', icon: IconFiles, label: 'Docs' },
  { to: '/student/pref-list', icon: IconListNumbers, label: 'Pref List' },
  { to: '/student/timeline', icon: IconTimeline, label: 'Timeline' },
]

export function StudentLayout() {
  const { unreadCount } = useNotifications()
  const { user } = useAuth()
  const navigate = useNavigate()

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-mobile mx-auto min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <img src="/logo.webp" alt="MindzSpark" className="w-7 h-7" />
              <span className="text-[#1a1f36] font-bold text-base">MindzSpark</span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Sessions */}
              <button
                onClick={() => navigate('/student/sessions')}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                title="Sessions"
              >
                <IconCalendar size={21} className="text-gray-500" />
              </button>

              {/* Bell */}
              <button
                onClick={() => navigate('/student/notices')}
                className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <IconBell size={21} className="text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#ff6b35] rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Profile avatar */}
              <button
                onClick={() => navigate('/student/profile')}
                className="w-9 h-9 rounded-full bg-[#1a1f36] flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <span className="text-white text-xs font-bold">{initials}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
          <Outlet />
        </main>

        {/* Bottom nav — 4 items */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-white border-t border-gray-100 z-40">
          <div className="flex items-center justify-around px-2 py-1">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors ${
                    isActive ? 'text-[#ff6b35]' : 'text-gray-400 hover:text-gray-600'
                  }`
                }
              >
                <Icon size={22} />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
