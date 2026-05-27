import { useEffect, useMemo, useState } from 'react'
import { hashPassword } from '@/utils/crypto'
import { Building2, Eye, EyeOff, KeyRound, LineChart, Plus, ShieldCheck, Trash2, X } from 'lucide-react'

import {
  createOrganization,
  deleteOrganization,
  listOrganizations,
  listPlans,
  listTasks,
  listUsers,
  type OrganizationOut,
  type ServicePlanOut,
} from '@/api/client'
import { Page, PageHeader, TwoCol } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/errors'
import {
  getAllPartnerCreds,
  removePartnerCred,
  setPartnerCred,
} from '@/utils/partnerCreds'

function typeLabel(t: string) {
  if (t === 'university') return 'Вуз'
  if (t === 'infrastructure') return 'Технопарк'
  if (t === 'government') return 'Гос. орган'
  return t
}

function CredForm({ org, onClose }: { org: OrganizationOut; onClose: () => void }) {
  const existing = getAllPartnerCreds()
  const existingEntry = Object.entries(existing).find(([, v]) => v.orgId === org.id)
  const hasCreds = !!existingEntry

  const [mode, setMode] = useState<'password' | 'full'>(hasCreds ? 'password' : 'full')
  const [credEmail, setCredEmail] = useState(existingEntry?.[0] ?? '')
  const [credPassword, setCredPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    if (mode === 'password') {
      if (!credPassword.trim()) return
      const passwordHash = await hashPassword(credPassword)
      setPartnerCred(existingEntry![0], { ...existingEntry![1], passwordHash })
    } else {
      if (!credEmail.trim() || !credPassword.trim()) return
      if (existingEntry && existingEntry[0] !== credEmail.trim()) {
        removePartnerCred(existingEntry[0])
      }
      const passwordHash = await hashPassword(credPassword)
      setPartnerCred(credEmail.trim().toLowerCase(), {
        passwordHash,
        orgId: org.id,
        orgName: org.name,
        orgType: org.type,
      })
    }
    setSaved(true)
    setTimeout(onClose, 800)
  }

  function revoke() {
    if (existingEntry) removePartnerCred(existingEntry[0])
    onClose()
  }

  return (
    <div className="mt-2 rounded-xl bg-[#0B1220] p-4 ring-1 ring-[#6C8CFF]/30 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6C8CFF]">
          {hasCreds ? 'Сменить пароль' : 'Выдать доступ'}: {org.name}
        </span>
        <button type="button" onClick={onClose} className="text-[#9FB0D0] hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {hasCreds && (
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMode('password')}
            className={`rounded-lg px-2.5 py-1 ${mode === 'password' ? 'bg-[#6C8CFF]/20 text-[#6C8CFF]' : 'text-[#9FB0D0] hover:text-white'}`}
          >
            Сменить пароль
          </button>
          <button
            type="button"
            onClick={() => setMode('full')}
            className={`rounded-lg px-2.5 py-1 ${mode === 'full' ? 'bg-[#6C8CFF]/20 text-[#6C8CFF]' : 'text-[#9FB0D0] hover:text-white'}`}
          >
            Изменить логин и пароль
          </button>
        </div>
      )}

      {mode === 'password' && hasCreds ? (
        <>
          <div className="rounded-lg bg-[#0F1830] px-3 py-2 text-xs text-[#9FB0D0]">
            Логин: <span className="text-white">{existingEntry![0]}</span>
          </div>
          <div>
            <div className="mb-1 text-xs text-[#9FB0D0]">Новый пароль</div>
            <div className="relative">
              <Input
                type={showPwd ? 'text' : 'password'}
                value={credPassword}
                onChange={(e) => setCredPassword(e.target.value)}
                placeholder="Введите новый пароль"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FB0D0] hover:text-white"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <div className="mb-1 text-xs text-[#9FB0D0]">Логин (email)</div>
            <Input
              value={credEmail}
              onChange={(e) => setCredEmail(e.target.value)}
              placeholder="partner@university.ru"
              autoComplete="off"
            />
          </div>
          <div>
            <div className="mb-1 text-xs text-[#9FB0D0]">Пароль</div>
            <div className="relative">
              <Input
                type={showPwd ? 'text' : 'password'}
                value={credPassword}
                onChange={(e) => setCredPassword(e.target.value)}
                placeholder="Придумайте пароль"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FB0D0] hover:text-white"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </>
      )}

      {saved && <Alert tone="success">Сохранено!</Alert>}

      <div className="flex gap-2">
        <Button variant="primary" type="button" onClick={() => void save()} className="flex-1">
          {mode === 'password' && hasCreds ? 'Сменить пароль' : 'Сохранить доступ'}
        </Button>
        {hasCreds && (
          <Button variant="danger" type="button" onClick={revoke}>
            Отозвать
          </Button>
        )}
      </div>
    </div>
  )
}

function StatCard(props: { title: string; value: string; subtitle?: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="text-xs text-[#9FB0D0]">{props.title}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{props.value}</div>
        {props.subtitle ? <div className="mt-1 text-xs text-[#9FB0D0]">{props.subtitle}</div> : null}
      </CardContent>
    </Card>
  )
}

export default function PartnerDashboard() {
  const user = useAuthStore((s) => s.user)
  const canView = user?.role === 'admin'

  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [orgs, setOrgs] = useState<OrganizationOut[]>([])
  const [plans, setPlans] = useState<ServicePlanOut[]>([])
  const [counts, setCounts] = useState<{ users: number; tasks: number; companies: number; universities: number }>({
    users: 0,
    tasks: 0,
    companies: 0,
    universities: 0,
  })

  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgType, setNewOrgType] = useState<'university' | 'infrastructure' | 'government'>('infrastructure')

  const [openCredOrgId, setOpenCredOrgId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const partnerValue = useMemo(
    () => [
      { k: 'Прозрачность', v: 'Сводная статистика по задачам и верификациям' },
      { k: 'Легитимность', v: 'Единый контур партнёров и сервисных уровней' },
      { k: 'Воронка талантов', v: 'Наблюдаем студентов в работе и рост компетенций' },
    ],
    [],
  )

  async function load() {
    setErr(null)
    try {
      const [u, t, companies, universities, p] = await Promise.all([
        listUsers().catch(() => []),
        listTasks().catch(() => []),
        listOrganizations({ type: 'company' }).catch(() => []),
        listOrganizations({ type: 'university' }).catch(() => []),
        listPlans().catch(() => []),
      ])
      setCounts({
        users: u.length,
        tasks: t.length,
        companies: companies.length,
        universities: universities.length,
      })
      setPlans(p)
      const partnerOrgs = await listOrganizations()
      setOrgs(partnerOrgs.filter((o) => o.type !== 'company'))
    } catch (e: unknown) {
      setErr(getErrorMessage(e, 'Не удалось загрузить панель партнёра'))
    }
  }

  async function doDelete(orgId: string) {
    setDeletingId(orgId)
    try {
      await deleteOrganization(orgId)
      const creds = getAllPartnerCreds()
      const credEmail = Object.entries(creds).find(([, v]) => v.orgId === orgId)?.[0]
      if (credEmail) removePartnerCred(credEmail)
      setOrgs((prev) => prev.filter((o) => o.id !== orgId))
    } catch (e: unknown) {
      setErr(getErrorMessage(e, 'Не удалось удалить партнёра'))
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  function hasCred(orgId: string) {
    return Object.values(getAllPartnerCreds()).some((c) => c.orgId === orgId)
  }

  useEffect(() => {
    load()
  }, [])

  if (!canView) {
    return (
      <Page>
        <PageHeader title="Панель управления партнёрами" subtitle="Для технопарков и Минцифры: метрики, партнёры, уровни сервиса." />
        <Alert tone="danger">Доступно для роли «Партнёр/Админ». Переключи роль на экране входа.</Alert>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader
        title="Панель управления партнёрами"
        right={
          <div className="flex items-center gap-2">
            <Badge tone="accent">MVP</Badge>
            <Button variant="secondary" type="button" onClick={load}>
              Обновить
            </Button>
          </div>
        }
      />

      {err ? <Alert tone="danger">{err}</Alert> : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Задачи в системе" value={String(counts.tasks)} subtitle="B2B спрос" />
        <StatCard title="Компании" value={String(counts.companies)} subtitle="Резиденты/клиенты" />
        <StatCard title="Вузы" value={String(counts.universities)} subtitle="Поставщики исполнителей" />
        <StatCard title="Пользователи" value={String(counts.users)} subtitle="Студенты/менторы/клиенты" />
      </div>

      <TwoCol
        main={
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-[#6C8CFF]" />
                  <div className="text-sm font-medium">Что показываем партнёрам</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  {partnerValue.map((x) => (
                    <div key={x.k} className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                      <div className="text-sm font-medium">{x.k}</div>
                      <div className="mt-1 text-xs text-[#9FB0D0]">{x.v}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#3DDC97]" />
                  <div className="text-sm font-medium">Уровни сервиса (SLA)</div>
                </div>
              </CardHeader>
              <CardContent>
                {plans.length === 0 ? (
                  <div className="text-sm text-[#9FB0D0]">Нет планов</div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    {plans.map((p) => (
                      <div key={p.code} className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="mt-1 text-xs text-[#9FB0D0]">
                          {p.monthly_price_rub.toLocaleString('ru-RU')} ₽/мес · SLA {p.sla_minutes} мин
                        </div>
                        <div className="mt-2 text-xs text-[#9FB0D0]">code: {p.code}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        }
        aside={
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#FF5A6A]" />
                  <div className="text-sm font-medium">Партнёры</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <form
                  className="space-y-2 rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setErr(null)
                    const name = newOrgName.trim()
                    if (!name) return
                    setBusy(true)
                    try {
                      const created = await createOrganization({ type: newOrgType, name, region: 'RT' })
                      setOrgs((prev) => [created, ...prev])
                      setNewOrgName('')
                    } catch (e: unknown) {
                      setErr(getErrorMessage(e, 'Не удалось создать партнёра'))
                    } finally {
                      setBusy(false)
                    }
                  }}
                >
                  <div className="text-xs text-[#9FB0D0]">Добавить партнёра (MVP)</div>
                  <select
                    className="w-full rounded-xl bg-[#111A2E] px-3 py-2 text-sm ring-1 ring-[#1E2A44] outline-none"
                    value={newOrgType}
                    onChange={(e) => setNewOrgType(e.target.value as 'infrastructure' | 'government' | 'university')}
                  >
                    <option value="infrastructure">Технопарк/инфраструктура</option>
                    <option value="government">Минцифры/гос.орган</option>
                    <option value="university">Вуз</option>
                  </select>
                  <Input value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder="Название организации" />
                  <Button variant="secondary" type="submit" disabled={busy}>
                    <Plus className="h-4 w-4" />
                    Добавить
                  </Button>
                </form>

                {orgs.length === 0 ? (
                  <div className="text-sm text-[#9FB0D0]">Партнёры не добавлены</div>
                ) : (
                  <div className="space-y-2">
                    {orgs.map((o) => (
                      <div key={o.id}>
                        <div className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate text-sm font-medium">{o.name}</span>
                                {hasCred(o.id) && (
                                  <Badge tone="success">Доступ</Badge>
                                )}
                              </div>
                              <div className="mt-0.5 text-xs text-[#9FB0D0]">{typeLabel(o.type)}</div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmDeleteId(null)
                                  setOpenCredOrgId(openCredOrgId === o.id ? null : o.id)
                                }}
                                className="rounded-lg bg-[#6C8CFF]/10 p-1.5 text-[#6C8CFF] hover:bg-[#6C8CFF]/20"
                                title={hasCred(o.id) ? 'Сменить пароль' : 'Выдать доступ'}
                              >
                                <KeyRound className="h-3.5 w-3.5" />
                              </button>
                              {confirmDeleteId === o.id ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-[#FF5A6A]">Удалить?</span>
                                  <button
                                    type="button"
                                    onClick={() => doDelete(o.id)}
                                    disabled={deletingId === o.id}
                                    className="rounded-lg bg-[#FF5A6A]/20 px-2 py-1 text-xs text-[#FF5A6A] hover:bg-[#FF5A6A]/30 disabled:opacity-50"
                                  >
                                    {deletingId === o.id ? '…' : 'Да'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="rounded-lg px-1 py-1 text-xs text-[#9FB0D0] hover:text-white"
                                  >
                                    Нет
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenCredOrgId(null)
                                    setConfirmDeleteId(o.id)
                                  }}
                                  className="rounded-lg p-1.5 text-[#9FB0D0] hover:text-[#FF5A6A]"
                                  title="Удалить партнёра"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        {openCredOrgId === o.id && (
                          <CredForm org={o} onClose={() => setOpenCredOrgId(null)} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        }
      />
    </Page>
  )
}
