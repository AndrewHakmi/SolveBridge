import type { AuthUser } from '@/stores/authStore'

const KEY = 'sb:user_cache'
const VERSION_KEY = 'sb:auth_version'
const CURRENT_VERSION = '2'

// Clears old plain-text credential stores from before password hashing was introduced
function migrateIfNeeded() {
  if (localStorage.getItem(VERSION_KEY) !== CURRENT_VERSION) {
    localStorage.removeItem(KEY)
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
  }
}

// Stores user info (no password) for the user picker UI
export type CachedUser = AuthUser

export function getCachedUser(email: string): CachedUser | null {
  migrateIfNeeded()
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, CachedUser>
    return all[email.toLowerCase()] ?? null
  } catch {
    return null
  }
}

export function setCachedUser(user: AuthUser) {
  migrateIfNeeded()
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, CachedUser>
    all[user.email.toLowerCase()] = user
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch (e) {
    void e
  }
}

export function getAllCachedUsers(): CachedUser[] {
  migrateIfNeeded()
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, CachedUser>
    return Object.values(all)
  } catch {
    return []
  }
}
