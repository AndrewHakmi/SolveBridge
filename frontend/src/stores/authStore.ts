import { create } from 'zustand'

export type UserRole = 'client' | 'student' | 'executor' | 'mentor' | 'admin' | 'partner' | 'company'

export type AuthUser = {
  id: string
  email: string
  name: string
  role: UserRole
  universityOrgIds?: string[]  // for students: verified org IDs
  universityText?: string       // for executors: free-text university name
}

export function labelForRole(role: UserRole) {
  if (role === 'client') return 'Заказчик'
  if (role === 'student') return 'Студент'
  if (role === 'executor') return 'Исполнитель'
  if (role === 'mentor') return 'Ментор'
  if (role === 'admin') return 'Администратор'
  if (role === 'partner') return 'Партнёр'
  if (role === 'company') return 'Компания'
  return role
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
