import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  IconLayoutDashboard, IconUsers, IconUserShield, IconListNumbers,
  IconBell, IconSettings, IconLogout, IconMenu2, IconX, IconCalendarEvent
} from '@tabler/icons-react'
import { useAuthStore } from '../../store/authStore'
import { useNotifications } from '../../hooks/useNotifications'
import { Avatar } from '../shared/Avatar'

const NAV = [
  { to: '/admin/dashboard', icon: IconLayoutDashboard, label: 'Overview' },
  { to: '/admin/students', icon: IconUsers, label: 'Students' },
  { to: '/admin/counselors', icon: IconUserShield, label: 'Counselors' },
  { to: '/admin/pref-lists', icon: IconListNumbers, label: 'Pref Lists' },
  { to: '/admin/cap-timeline', icon: IconCalendarEvent, label: 'CAP Timeline' },
  { to: '/admin/notifications', icon: IconBell, label: 'Notifications' },
  { to: '/admin/settings', icon: IconSettings, label: 'Settings' },
]

export function AdminLayout() {
  const { user, clearAuth } = useAuthStore()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'A'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 md:w-60 bg-[#1a1f36] flex flex-col z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.webp" alt="MindzSpark" className="w-8 h-8 flex-shrink-0" />
              <div>
                <h1 className="text-white font-bold text-base leading-tight">MindzSpark</h1>
                <p className="text-blue-300 text-[11px]">Admin Portal</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/60 hover:text-white p-1">
              <IconX size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative ${
                  isActive ? 'bg-[#ff6b35] text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="absolute right-3 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4 border-t border-white/10 pt-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar name={user?.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-blue-300 text-xs">{user?.memberId}</p>
            </div>
            <button onClick={() => { clearAuth(); navigate('/login') }} className="text-blue-300 hover:text-white transition-colors">
              <IconLogout size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#1a1f36] flex items-center px-4 h-14 gap-3">
        <button onClick={() => setSidebarOpen(true)} className="text-white p-1">
          <IconMenu2 size={22} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <img src="/logo.webp" alt="MindzSpark" className="w-7 h-7" />
          <span className="text-white font-bold text-base">MindzSpark</span>
        </div>
        <button onClick={() => navigate('/admin/notifications')} className="relative w-9 h-9 flex items-center justify-center text-white">
          <IconBell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#ff6b35] rounded-full flex items-center justify-center text-white text-[9px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button onClick={() => setSidebarOpen(true)} className="w-8 h-8 rounded-full bg-[#ff6b35] flex items-center justify-center">
          <span className="text-white text-xs font-bold">{initials}</span>
        </button>
      </header>

      <main className="md:ml-60 min-h-screen pt-14 md:pt-0 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
