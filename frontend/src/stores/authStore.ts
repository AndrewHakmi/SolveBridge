import { create } from 'zustand'

export type UserRole = 'client' | 'student' | 'mentor' | 'admin'

export type AuthUser = {
  id: string
  email: string
  name: string
  role: UserRole
}

export function labelForRole(role: UserRole) {
  if (role === 'client') return 'Клиент'
  if (role === 'student') return 'Студент'
  if (role === 'mentor') return 'Ментор'
  return 'Партнёр'
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
