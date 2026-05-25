const KEY = 'sb:mentors'

export type MentorEntry = {
  userId: string
  email: string
  name: string
  password?: string
  assignedBy: string  // email of who assigned
  assignedAt: string  // ISO string
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

export function checkMentorCred(email: string, password: string): MentorEntry | null {
  const entry = Object.values(readAll()).find(
    (m) => m.email.toLowerCase() === email.toLowerCase(),
  )
  if (!entry || !entry.password || entry.password !== password) return null
  return entry
}
