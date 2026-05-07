import { create } from 'zustand'

export type UserRole = 'employee' | 'manager' | 'admin'

export type AuthUser = {
  id: string
  name: string
  role: UserRole
}

type AuthState = {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('tkos:user')
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof window === 'undefined' ? null : readStoredUser(),
  login: (user) => {
    localStorage.setItem('tkos:user', JSON.stringify(user))
    set({ user })
  },
  logout: () => {
    localStorage.removeItem('tkos:user')
    set({ user: null })
  },
}))

