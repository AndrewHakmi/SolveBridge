export type PartnerCred = {
  password: string
  orgId: string
  orgName: string
  orgType: string
}

export type CompanyCred = {
  password: string
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

export function checkPartnerCred(email: string, password: string): PartnerCred | null {
  const cred = getAllPartnerCreds()[email]
  if (!cred || cred.password !== password) return null
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

export function checkCompanyCred(email: string, password: string): CompanyCred | null {
  const cred = getAllCompanyCreds()[email]
  if (!cred || cred.password !== password) return null
  return cred
}

export function getCompaniesByPartner(partnerEmail: string): Array<[string, CompanyCred]> {
  return Object.entries(getAllCompanyCreds()).filter(([, c]) => c.addedByEmail === partnerEmail)
}
