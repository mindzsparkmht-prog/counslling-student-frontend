import { useEffect } from 'react'
import { useNotifStore } from '../store/notifStore'
import { useAuth } from './useAuth'

export function useNotifications() {
  const { user } = useAuth()
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead } = useNotifStore()

  useEffect(() => {
    if (user) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  return { notifications, unreadCount, markRead, markAllRead, refresh: fetchNotifications }
}
