import type { AuthUser } from '@/stores/authStore'

const KEY = 'sb:user_cache'

export type CachedUser = AuthUser & { password: string }

export function getCachedUser(email: string): CachedUser | null {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, CachedUser>
    return all[email.toLowerCase()] ?? null
  } catch {
    return null
  }
}

export function setCachedUser(user: CachedUser) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, CachedUser>
    all[user.email.toLowerCase()] = user
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch (e) {
    void e
  }
}

export function checkUserCred(email: string, password: string): CachedUser | null {
  const user = getCachedUser(email)
  if (!user || user.password !== password) return null
  return user
}

export function getAllCachedUsers(): CachedUser[] {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, CachedUser>
    return Object.values(all)
  } catch {
    return []
  }
}
