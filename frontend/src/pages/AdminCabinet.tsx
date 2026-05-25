import { useEffect, useState } from 'react'
import {
  Building2,
  GraduationCap,
  ShieldCheck,
  Trash2,
  Users,
  BarChart3,
  Briefcase,
  Plus,
  KeyRound,
  X,
  Eye,
  EyeOff,
} from 'lucide-react'

import {
  createOrganization,
  listOrganizations,
  listTasks,
  listUsers,
  type OrganizationOut,
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
  setPartnerCred,
  removePartnerCred,
} from '@/utils/partnerCreds'

type OrgStatus = 'pending' | 'approved' | 'rejected'
type LocalOrg = OrganizationOut & { status: OrgStatus }

function typeLabel(t: string) {
  if (t === 'university') return 'Вуз'
  if (t === 'infrastructure') return 'Технопарк'
  if (t === 'government') return 'Гос. орган'
  return t
}

function statusBadge(s: OrgStatus) {
  if (s === 'approved') return <Badge tone="success">Одобрен</Badge>
  if (s === 'rejected') return <Badge tone="danger">Отклонён</Badge>
  return <Badge tone="accent">На модерации</Badge>
}

function CredForm({
  org,
  onClose,
}: {
  org: LocalOrg
  onClose: () => void
}) {
  const existing = getAllPartnerCreds()
  const existingEntry = Object.entries(existing).find(([, v]) => v.orgId === org.id)

  const [credEmail, setCredEmail] = useState(existingEntry?.[0] ?? '')
  const [credPassword, setCredPassword] = useState(existingEntry?.[1]?.password ?? '')
  const [showPwd, setShowPwd] = useState(false)
  const [saved, setSaved] = useState(false)

  function save() {
    if (!credEmail.trim() || !credPassword.trim()) return
    if (existingEntry && existingEntry[0] !== credEmail.trim()) {
      removePartnerCred(existingEntry[0])
    }
    setPartnerCred(credEmail.trim().toLowerCase(), {
      password: credPassword,
      orgId: org.id,
      orgName: org.name,
      orgType: org.type,
    })
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
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6C8CFF]">Доступ для: {org.name}</span>
        <button type="button" onClick={onClose} className="text-[#9FB0D0] hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

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

      {saved && <Alert tone="success">Сохранено!</Alert>}

      <div className="flex gap-2">
        <Button variant="primary" type="button" onClick={save} className="flex-1">
          Сохранить доступ
        </Button>
        {existingEntry && (
          <Button variant="danger" type="button" onClick={revoke}>
            Отозвать
          </Button>
        )}
      </div>
    </div>
  )
}

export default function AdminCabinet() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'

  const [err, setErr] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    users: number; tasks: number; open: number; universities: number; technoparks: number
  } | null>(null)

  const [orgs, setOrgs] = useState<LocalOrg[]>([])
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'university' | 'infrastructure' | 'government'>('university')
  const [busy, setBusy] = useState(false)
  const [openCredOrgId, setOpenCredOrgId] = useState<string | null>(null)

  const statusKey = 'sb:org_statuses'

  function loadStatuses(): Record<string, OrgStatus> {
    try { return JSON.parse(localStorage.getItem(statusKey) || '{}') } catch { return {} }
  }

  function saveStatus(id: string, status: OrgStatus) {
    const s = loadStatuses()
    s[id] = status
    localStorage.setItem(statusKey, JSON.stringify(s))
    setOrgs((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
  }

  function hasCred(orgId: string) {
    return Object.values(getAllPartnerCreds()).some((c) => c.orgId === orgId)
  }

  async function load() {
    setErr(null)
    try {
      const [users, tasks, universities, technoparks] = await Promise.all([
        listUsers().catch(() => []),
        listTasks().catch(() => []),
        listOrganizations({ type: 'university' }).catch(() => []),
        listOrganizations({ type: 'infrastructure' }).catch(() => []),
      ])
      setStats({
        users: users.length,
        tasks: tasks.length,
        open: tasks.filter((t) => t.status === 'open').length,
        universities: universities.length,
        technoparks: technoparks.length,
      })
      const all = await listOrganizations().catch(() => [])
      const statuses = loadStatuses()
      setOrgs(all.filter((o) => o.type !== 'company').map((o) => ({ ...o, status: statuses[o.id] ?? 'pending' })))
    } catch (e: unknown) {
      setErr(getErrorMessage(e, 'Не удалось загрузить данные'))
    }
  }

  useEffect(() => { load() }, [])

  if (!isAdmin) {
    return (
      <Page>
        <PageHeader title="Кабинет администратора" subtitle="Доступно только для роли Администратор." />
        <Alert tone="danger">У вас нет доступа к этому разделу.</Alert>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader
        title="Кабинет администратора"
        subtitle="Модерация партнёров и общая статистика платформы."
        right={<Button variant="secondary" type="button" onClick={load}>Обновить</Button>}
      />

      {err ? <Alert tone="danger">{err}</Alert> : null}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { icon: <Users className="h-4 w-4 text-[#6C8CFF]" />, label: 'Пользователи', value: stats?.users },
          { icon: <Briefcase className="h-4 w-4 text-[#3DDC97]" />, label: 'Задачи', value: stats?.tasks },
          { icon: <BarChart3 className="h-4 w-4 text-[#FF5A6A]" />, label: 'Открытых', value: stats?.open },
          { icon: <GraduationCap className="h-4 w-4 text-[#9FB0D0]" />, label: 'Вузов', value: stats?.universities },
          { icon: <Building2 className="h-4 w-4 text-[#9FB0D0]" />, label: 'Технопарков', value: stats?.technoparks },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent>
              <div className="flex items-center gap-2">
                {s.icon}
                <span className="text-xs text-[#9FB0D0]">{s.label}</span>
              </div>
              <div className="mt-2 text-2xl font-semibold">{s.value ?? '—'}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <TwoCol
        main={
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#6C8CFF]" />
                <div className="text-xs font-semibold uppercase tracking-wider">Модерация партнёров</div>
              </div>
            </CardHeader>
            <CardContent>
              {orgs.length === 0 ? (
                <div className="text-sm text-[#9FB0D0]">Партнёры не добавлены</div>
              ) : (
                <div className="space-y-2">
                  {orgs.map((o) => (
                    <div key={o.id}>
                      <div className="flex items-center justify-between rounded-xl bg-[#0F1830] px-4 py-3 ring-1 ring-[#1E2A44]">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">{o.name}</span>
                            {hasCred(o.id) && (
                              <Badge tone="success">Есть доступ</Badge>
                            )}
                          </div>
                          <div className="mt-0.5 text-xs text-[#9FB0D0]">{typeLabel(o.type)}</div>
                        </div>
                        <div className="ml-3 flex shrink-0 items-center gap-2">
                          {statusBadge(o.status)}
                          <button
                            type="button"
                            onClick={() => setOpenCredOrgId(openCredOrgId === o.id ? null : o.id)}
                            className="rounded-lg bg-[#6C8CFF]/10 p-1.5 text-[#6C8CFF] hover:bg-[#6C8CFF]/20"
                            title="Управление доступом"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>
                          {o.status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => saveStatus(o.id, 'approved')}
                              className="rounded-lg bg-[#3DDC97]/10 px-2 py-1 text-xs text-[#3DDC97] hover:bg-[#3DDC97]/20"
                            >
                              Одобрить
                            </button>
                          )}
                          {o.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => saveStatus(o.id, 'rejected')}
                              className="rounded-lg p-1 text-[#9FB0D0] hover:text-[#FF5A6A]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
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
        }
        aside={
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center gap-2">
                <Building2 className="h-4 w-4 text-[#FF5A6A]" />
                <div className="text-xs font-semibold uppercase tracking-wider">Добавить партнёра</div>
              </div>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const name = newName.trim()
                  if (!name) return
                  setErr(null)
                  setBusy(true)
                  try {
                    const created = await createOrganization({ type: newType, name, region: 'RT' })
                    const statuses = loadStatuses()
                    setOrgs((prev) => [{ ...created, status: statuses[created.id] ?? 'pending' }, ...prev])
                    setNewName('')
                  } catch (e: unknown) {
                    setErr(getErrorMessage(e, 'Не удалось добавить'))
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                <div>
                  <div className="mb-1 text-xs text-[#9FB0D0]">Тип организации</div>
                  <select
                    className="w-full rounded-xl bg-[#0F1830] px-3 py-2 text-sm ring-1 ring-[#1E2A44] outline-none"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as typeof newType)}
                  >
                    <option value="university">Вуз</option>
                    <option value="infrastructure">Технопарк</option>
                    <option value="government">Гос. орган</option>
                  </select>
                </div>
                <div>
                  <div className="mb-1 text-xs text-[#9FB0D0]">Название</div>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="КФУ, Иннополис, Минцифры РТ…"
                  />
                </div>
                <Button variant="primary" type="submit" disabled={busy} className="w-full">
                  <Plus className="h-4 w-4" />
                  {busy ? 'Добавляю…' : 'Добавить'}
                </Button>
              </form>
            </CardContent>
          </Card>
        }
      />
    </Page>
  )
}
