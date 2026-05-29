import { hashPassword } from './crypto'

export type PartnerCred = {
  passwordHash: string
  orgId: string
  orgName: string
  orgType: string
}

export type CompanyCred = {
  passwordHash: string
  companyId: string
  companyName: string
  addedByEmail: string
}

const KEY = 'sb:partner_creds'
const COMPANY_KEY = 'sb:company_creds'

export function getAllPartnerCreds(): Record<string, PartnerCred> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}

export function setPartnerCred(email: string, cred: PartnerCred) {
  const all = getAllPartnerCreds()
  all[email] = cred
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function removePartnerCred(email: string) {
  const all = getAllPartnerCreds()
  delete all[email]
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function isPartnerEmail(email: string): boolean {
  return email in getAllPartnerCreds()
}

export async function checkPartnerCred(email: string, password: string): Promise<PartnerCred | null> {
  const cred = getAllPartnerCreds()[email]
  if (!cred || !cred.passwordHash) return null
  const hash = await hashPassword(password)
  if (hash !== cred.passwordHash) return null
  return cred
}

// Company credentials
export function getAllCompanyCreds(): Record<string, CompanyCred> {
  try { return JSON.parse(localStorage.getItem(COMPANY_KEY) || '{}') } catch { return {} }
}

export function setCompanyCred(email: string, cred: CompanyCred) {
  const all = getAllCompanyCreds()
  all[email] = cred
  localStorage.setItem(COMPANY_KEY, JSON.stringify(all))
}

export function removeCompanyCred(email: string) {
  const all = getAllCompanyCreds()
  delete all[email]
  localStorage.setItem(COMPANY_KEY, JSON.stringify(all))
}

export function isCompanyEmail(email: string): boolean {
  return email in getAllCompanyCreds()
}

export async function checkCompanyCred(email: string, password: string): Promise<CompanyCred | null> {
  const cred = getAllCompanyCreds()[email]
  if (!cred || !cred.passwordHash) return null
  const hash = await hashPassword(password)
  if (hash !== cred.passwordHash) return null
  return cred
}

export function getCompaniesByPartner(partnerEmail: string): Array<[string, CompanyCred]> {
  return Object.entries(getAllCompanyCreds()).filter(([, c]) => c.addedByEmail === partnerEmail)
}
