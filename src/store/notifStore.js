import { create } from 'zustand'
import api from '../lib/api'

export const useNotifStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const { data } = await api.get('/api/notifications/mine')
      set({
        notifications: data,
        unreadCount: data.filter(n => !n.is_read).length
      })
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  },

  markRead: async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`)
      set(state => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }))
    } catch (err) {
      console.error('Failed to mark read:', err)
    }
  },

  markAllRead: async () => {
    try {
      await api.put('/api/notifications/read-all')
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
      }))
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }
}))
