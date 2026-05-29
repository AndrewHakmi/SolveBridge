import { useEffect, useState } from 'react'
import { hashPassword } from '@/utils/crypto'
import {
  Building2,
  GraduationCap,
  Plus,
  KeyRound,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  UserMinus,
} from 'lucide-react'

import {
  createOrganization,
  createUser,
  listUniversityVerifications,
  reviewVerification,
  type StudentVerificationOut,
} from '@/api/client'
import { getMentors, addMentorWithPassword, removeMentor, type MentorEntry } from '@/utils/mentorRegistry'
import { getErrorMessage } from '@/utils/errors'
import { Page, PageHeader, TwoCol } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'
import { getAllPartnerCreds } from '@/utils/partnerCreds'
import {
  getCompaniesByPartner,
  setCompanyCred,
  removeCompanyCred,
  getAllCompanyCreds,
  type CompanyCred,
} from '@/utils/partnerCreds'

function statusBadge(status: string) {
  if (status === 'approved')
    return <span className="inline-flex items-center gap-1 rounded-full bg-[#3DDC97]/10 px-2 py-0.5 text-xs font-medium text-[#3DDC97]"><CheckCircle2 className="h-3 w-3" />Подтверждён</span>
  if (status === 'rejected')
    return <span className="inline-flex items-center gap-1 rounded-full bg-[#FF5A6A]/10 px-2 py-0.5 text-xs font-medium text-[#FF5A6A]"><XCircle className="h-3 w-3" />Отклонён</span>
  return <span className="inline-flex items-center gap-1 rounded-full bg-[#6C8CFF]/10 px-2 py-0.5 text-xs font-medium text-[#6C8CFF]"><Clock className="h-3 w-3" />На проверке</span>
}

function UniversityModerationPanel({ orgId }: { orgId: string }) {
  const [items, setItems] = useState<StudentVerificationOut[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      setItems(await listUniversityVerifications(orgId))
    } catch {
      setErr('Не удалось загрузить заявки')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [orgId])

  async function handle(id: string, action: 'approve' | 'reject') {
    setBusyId(id)
    try {
      const updated = await reviewVerification(id, action)
      setItems((prev) => prev.map((v) => (v.id === id ? updated : v)))
    } catch {
      setErr('Не удалось обработать заявку')
    } finally {
      setBusyId(null)
    }
  }

  const pending = items.filter((v) => v.status === 'pending')
  const reviewed = items.filter((v) => v.status !== 'pending')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-center gap-2">
          <GraduationCap className="h-4 w-4 text-[#6C8CFF]" />
          <div className="text-xs font-semibold uppercase tracking-wider">Верификация студентов</div>
        </div>
      </CardHeader>
      <CardContent>
        {err && <Alert tone="danger">{err}</Alert>}
        {loading ? (
          <div className="text-sm text-[#9FB0D0]">Загружаю…</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl bg-[#0F1830] p-4 text-center text-sm text-[#9FB0D0] ring-1 ring-[#1E2A44]">
            Заявок на верификацию пока нет
          </div>
        ) : (
          <div className="space-y-3">
            {pending.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6C8CFF]">
                  Ожидают решения ({pending.length})
                </div>
                <div className="space-y-2">
                  {pending.map((v) => (
                    <div key={v.id} className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            ID студента: <span className="font-mono text-xs text-[#9FB0D0]">{v.student_id}</span>
                          </div>
                          {v.document_ref && (
                            <div className="mt-1 text-xs text-[#9FB0D0] truncate">Документ: {v.document_ref}</div>
                          )}
                          <div className="mt-1 text-[10px] text-[#9FB0D0]">
                            {v.created_at ? new Date(v.created_at).toLocaleDateString('ru-RU') : ''}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            disabled={busyId === v.id}
                            onClick={() => handle(v.id, 'approve')}
                            className="flex items-center gap-1 rounded-lg bg-[#3DDC97]/10 px-3 py-1.5 text-xs font-medium text-[#3DDC97] hover:bg-[#3DDC97]/20 disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Подтвердить
                          </button>
                          <button
                            type="button"
                            disabled={busyId === v.id}
                            onClick={() => handle(v.id, 'reject')}
                            className="flex items-center gap-1 rounded-lg bg-[#FF5A6A]/10 px-3 py-1.5 text-xs font-medium text-[#FF5A6A] hover:bg-[#FF5A6A]/20 disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Отклонить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reviewed.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#9FB0D0]">
                  Обработанные ({reviewed.length})
                </div>
                <div className="space-y-2">
                  {reviewed.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded-xl bg-[#0B1220] px-3 py-2 ring-1 ring-[#1E2A44]">
                      <div className="min-w-0">
                        <div className="text-xs font-mono text-[#9FB0D0] truncate">{v.student_id}</div>
                        {v.document_ref && (
                          <div className="text-[10px] text-[#9FB0D0] truncate">{v.document_ref}</div>
                        )}
                      </div>
                      <div className="ml-3 shrink-0">{statusBadge(v.status)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MentorRegistrationPanel({ assignerEmail }: { assignerEmail: string }) {
  const [mentors, setMentors] = useState<MentorEntry[]>(() =>
    getMentors().filter((m) => m.assignedBy === assignerEmail),
  )
  const [mentorName, setMentorName] = useState('')
  const [mentorEmail, setMentorEmail] = useState('')
  const [mentorPassword, setMentorPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function refreshList() {
    setMentors(getMentors().filter((m) => m.assignedBy === assignerEmail))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setSuccess(null)
    const vEmail = mentorEmail.trim().toLowerCase()
    const vName = mentorName.trim()
    if (!vEmail || !vName || !mentorPassword) return
    if (mentorPassword.length < 6) { setErr('Пароль должен быть не короче 6 символов'); return }
    if (getMentors().some((m) => m.email.toLowerCase() === vEmail)) {
      setErr('Ментор с таким email уже зарегистрирован')
      return
    }
    setBusy(true)
    try {
      const created = await createUser({ email: vEmail, display_name: vName })
      await addMentorWithPassword(
        {
          userId: created.id,
          email: vEmail,
          name: vName,
          assignedBy: assignerEmail,
          assignedAt: new Date().toISOString(),
        },
        mentorPassword,
      )
      refreshList()
      setMentorName('')
      setMentorEmail('')
      setMentorPassword('')
      setSuccess(`Ментор «${vName}» создан. Передайте ему email и пароль для входа на платформу.`)
    } catch (e: unknown) {
      setErr(getErrorMessage(e, 'Не удалось создать ментора'))
    } finally {
      setBusy(false)
    }
  }

  function handleRemove(userId: string) {
    removeMentor(userId)
    refreshList()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-center gap-2">
          <UserCheck className="h-4 w-4 text-[#A78BFA]" />
          <div className="text-xs font-semibold uppercase tracking-wider">Менторы</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={handleCreate}
          className="space-y-3 rounded-xl bg-[#0F1830] p-4 ring-1 ring-[#1E2A44]"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-[#A78BFA]">
            Зарегистрировать ментора
          </div>
          <div>
            <div className="mb-1 text-xs text-[#9FB0D0]">Имя</div>
            <Input
              value={mentorName}
              onChange={(e) => { setMentorName(e.target.value); setErr(null) }}
              placeholder="Иван Иванов"
              autoComplete="off"
            />
          </div>
          <div>
            <div className="mb-1 text-xs text-[#9FB0D0]">Email</div>
            <Input
              value={mentorEmail}
              onChange={(e) => { setMentorEmail(e.target.value); setErr(null) }}
              placeholder="mentor@example.ru"
              inputMode="email"
              autoComplete="off"
            />
          </div>
          <div>
            <div className="mb-1 text-xs text-[#9FB0D0]">Пароль для входа</div>
            <div className="relative">
              <Input
                type={showPwd ? 'text' : 'password'}
                value={mentorPassword}
                onChange={(e) => { setMentorPassword(e.target.value); setErr(null) }}
                placeholder="Минимум 6 символов"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FB0D0] hover:text-white transition"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {err && <Alert tone="danger">{err}</Alert>}
          {success && <Alert tone="success">{success}</Alert>}
          <Button
            variant="primary"
            type="submit"
            disabled={busy || !mentorName.trim() || !mentorEmail.trim() || !mentorPassword}
            className="w-full"
          >
            {busy ? 'Создаю…' : <><UserCheck className="mr-1.5 h-4 w-4" />Зарегистрировать</>}
          </Button>
        </form>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#9FB0D0]">
            Зарегистрированные вами менторы ({mentors.length})
          </div>
          {mentors.length === 0 ? (
            <div className="rounded-xl bg-[#0F1830] p-3 text-sm text-[#9FB0D0] ring-1 ring-[#1E2A44]">
              Менторы ещё не добавлены
            </div>
          ) : (
            <div className="space-y-2">
              {mentors.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center justify-between rounded-xl bg-[#0F1830] px-3 py-2 ring-1 ring-[#1E2A44]"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{m.name}</div>
                    <div className="text-xs text-[#9FB0D0] truncate">{m.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(m.userId)}
                    className="ml-3 flex shrink-0 items-center gap-1 rounded-lg bg-[#FF5A6A]/10 px-2.5 py-1 text-xs font-medium text-[#FF5A6A] hover:bg-[#FF5A6A]/20"
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function typeLabel(t: string) {
  if (t === 'university') return 'Вуз'
  if (t === 'infrastructure') return 'Технопарк'
  if (t === 'government') return 'Гос. орган'
  return t
}

type LocalCompany = { email: string; cred: CompanyCred }

function CompanyCredForm({
  company,
  partnerEmail,
  onClose,
  onSaved,
}: {
  company: LocalCompany
  partnerEmail: string
  onClose: () => void
  onSaved: () => void
}) {
  const existing = Object.entries(getAllCompanyCreds()).find(([, v]) => v.companyId === company.cred.companyId)
  const [credEmail, setCredEmail] = useState(existing?.[0] ?? '')
  const [credPassword, setCredPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    if (!credEmail.trim() || !credPassword.trim()) return
    if (existing && existing[0] !== credEmail.trim()) removeCompanyCred(existing[0])
    const passwordHash = await hashPassword(credPassword)
    setCompanyCred(credEmail.trim().toLowerCase(), {
      passwordHash,
      companyId: company.cred.companyId,
      companyName: company.cred.companyName,
      addedByEmail: partnerEmail,
    })
    setSaved(true)
    setTimeout(() => { onSaved(); onClose() }, 700)
  }

  return (
    <div className="mt-2 rounded-xl bg-[#0B1220] p-4 ring-1 ring-[#6C8CFF]/30 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6C8CFF]">
          Доступ для: {company.cred.companyName}
        </span>
        <button type="button" onClick={onClose} className="text-[#9FB0D0] hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div>
        <div className="mb-1 text-xs text-[#9FB0D0]">Логин (email)</div>
        <Input value={credEmail} onChange={(e) => setCredEmail(e.target.value)} placeholder="company@example.ru" autoComplete="off" />
      </div>
      <div>
        <div className="mb-1 text-xs text-[#9FB0D0]">Пароль</div>
        <div className="relative">
          <Input
            type={showPwd ? 'text' : 'password'}
            value={credPassword}
            onChange={(e) => setCredPassword(e.target.value)}
            placeholder="Придумайте пароль"
          />
          <button type="button" onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FB0D0] hover:text-white">
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {saved && <Alert tone="success">Сохранено!</Alert>}
      <div className="flex gap-2">
        <Button variant="primary" type="button" onClick={() => void save()} className="flex-1">Сохранить доступ</Button>
        {existing && (
          <Button variant="danger" type="button" onClick={() => { removeCompanyCred(existing[0]); onSaved(); onClose() }}>
            Отозвать
          </Button>
        )}
      </div>
    </div>
  )
}

export default function PartnerCabinet() {
  const user = useAuthStore((s) => s.user)

  const partnerEmail = user?.email ?? ''
  const cred = partnerEmail ? getAllPartnerCreds()[partnerEmail] : null

  const [companies, setCompanies] = useState<LocalCompany[]>([])
  const [newName, setNewName] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [openCredId, setOpenCredId] = useState<string | null>(null)

  function refreshCompanies() {
    const list = getCompaniesByPartner(partnerEmail)
    setCompanies(list.map(([email, c]) => ({ email, cred: c })))
  }

  useEffect(() => { refreshCompanies() }, [partnerEmail])

  function hasCompanyCred(companyId: string) {
    return Object.values(getAllCompanyCreds()).some((c) => c.companyId === companyId)
  }

  async function addCompany(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setErr(null)
    setBusy(true)
    try {
      const created = await createOrganization({ type: 'company', name, region: 'RT' })
      setCompanyCred(`${created.id}@company.local`, {
        passwordHash: '',
        companyId: created.id,
        companyName: created.name,
        addedByEmail: partnerEmail,
      })
      setNewName('')
      refreshCompanies()
    } catch (e: unknown) {
      setErr(getErrorMessage(e, 'Не удалось добавить компанию'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page>
      <PageHeader
        title="Личный кабинет партнёра"
        subtitle="Управление компаниями и доступами."
      />

      {err ? <Alert tone="danger">{err}</Alert> : null}

      <TwoCol
        main={
          <div className="space-y-4">
            {/* Partner org info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center gap-2">
                  {cred?.orgType === 'university'
                    ? <GraduationCap className="h-4 w-4 text-[#6C8CFF]" />
                    : <Building2 className="h-4 w-4 text-[#6C8CFF]" />}
                  <div className="text-xs font-semibold uppercase tracking-wider">Ваша организация</div>
                </div>
              </CardHeader>
              <CardContent>
                {cred ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44] col-span-2">
                      <div className="text-xs text-[#9FB0D0]">Название</div>
                      <div className="mt-1 font-semibold">{cred.orgName}</div>
                    </div>
                    <div className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                      <div className="text-xs text-[#9FB0D0]">Тип</div>
                      <div className="mt-1 text-sm">{typeLabel(cred.orgType)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-[#9FB0D0]">Данные не найдены. Обратитесь к администратору.</div>
                )}
              </CardContent>
            </Card>

            {/* Companies list */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center gap-2">
                  <Building2 className="h-4 w-4 text-[#3DDC97]" />
                  <div className="text-xs font-semibold uppercase tracking-wider">Компании</div>
                </div>
              </CardHeader>
              <CardContent>
                {companies.length === 0 ? (
                  <div className="text-sm text-[#9FB0D0]">Компании не добавлены</div>
                ) : (
                  <div className="space-y-2">
                    {companies.map((co) => (
                      <div key={co.cred.companyId}>
                        <div className="flex items-center justify-between rounded-xl bg-[#0F1830] px-4 py-3 ring-1 ring-[#1E2A44]">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium">{co.cred.companyName}</span>
                              {hasCompanyCred(co.cred.companyId) && co.email !== `${co.cred.companyId}@company.local` && (
                                <Badge tone="success">Есть доступ</Badge>
                              )}
                            </div>
                            {co.email !== `${co.cred.companyId}@company.local` && (
                              <div className="mt-0.5 text-xs text-[#9FB0D0]">{co.email}</div>
                            )}
                          </div>
                          <div className="ml-3 flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setOpenCredId(openCredId === co.cred.companyId ? null : co.cred.companyId)}
                              className="rounded-lg bg-[#6C8CFF]/10 p-1.5 text-[#6C8CFF] hover:bg-[#6C8CFF]/20"
                              title="Управление доступом"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {openCredId === co.cred.companyId && (
                          <CompanyCredForm
                            company={co}
                            partnerEmail={partnerEmail}
                            onClose={() => setOpenCredId(null)}
                            onSaved={refreshCompanies}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verification moderation — universities only */}
            {cred?.orgType === 'university' && cred.orgId && (
              <UniversityModerationPanel orgId={cred.orgId} />
            )}

            {/* Mentor registration — available to all partner types */}
            <MentorRegistrationPanel assignerEmail={partnerEmail} />
          </div>
        }
        aside={
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center gap-2">
                <Plus className="h-4 w-4 text-[#FF5A6A]" />
                <div className="text-xs font-semibold uppercase tracking-wider">Добавить компанию</div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={addCompany}>
                <div>
                  <div className="mb-1 text-xs text-[#9FB0D0]">Название компании</div>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ООО Пример, ИП Иванов…"
                  />
                </div>
                <Button variant="primary" type="submit" disabled={busy} className="w-full">
                  <Plus className="h-4 w-4" />
                  {busy ? 'Добавляю…' : 'Добавить'}
                </Button>
              </form>
              <div className="mt-4 rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                <div className="text-xs text-[#9FB0D0]">
                  После добавления нажмите 🔑 рядом с компанией чтобы выдать ей логин и пароль для входа в платформу.
                </div>
              </div>
            </CardContent>
          </Card>
        }
      />
    </Page>
  )
}
