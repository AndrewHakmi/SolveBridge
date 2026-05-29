import { hashPassword } from './crypto'

const KEY = 'sb:mentors'

export type MentorEntry = {
  userId: string
  email: string
  name: string
  passwordHash?: string
  assignedBy: string
  assignedAt: string
}

function readAll(): Record<string, MentorEntry> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, MentorEntry>
  } catch {
    return {}
  }
}

export function getMentors(): MentorEntry[] {
  return Object.values(readAll())
}

export function getMentor(userId: string): MentorEntry | null {
  return readAll()[userId] ?? null
}

export function addMentor(entry: MentorEntry): void {
  try {
    const all = readAll()
    all[entry.userId] = entry
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch (e) {
    void e
  }
}

export function removeMentor(userId: string): void {
  try {
    const all = readAll()
    delete all[userId]
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch (e) {
    void e
  }
}

export async function checkMentorCred(email: string, password: string): Promise<MentorEntry | null> {
  const entry = Object.values(readAll()).find(
    (m) => m.email.toLowerCase() === email.toLowerCase(),
  )
  if (!entry || !entry.passwordHash) return null
  const hash = await hashPassword(password)
  if (hash !== entry.passwordHash) return null
  return entry
}

export async function addMentorWithPassword(
  entry: Omit<MentorEntry, 'passwordHash'>,
  plainPassword: string,
): Promise<void> {
  const passwordHash = await hashPassword(plainPassword)
  addMentor({ ...entry, passwordHash })
}
