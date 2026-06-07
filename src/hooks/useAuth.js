import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { user, token, hydrated, setAuth, clearAuth } = useAuthStore()
  return { user, token, hydrated, setAuth, clearAuth, isAuthenticated: !!user }
}
