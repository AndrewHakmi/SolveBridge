import { useEffect, useMemo, useState } from 'react'
import { Building2, LineChart, Plus, ShieldCheck } from 'lucide-react'

import {
  createOrganization,
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

  useEffect(() => {
    load()
  }, [])

  if (!canView) {
    return (
      <Page>
        <PageHeader title="Панель партнёра" subtitle="Для технопарков и Минцифры: метрики, партнёры, уровни сервиса." />
        <Alert tone="danger">Доступно для роли «Партнёр/Админ». Переключи роль на экране входа.</Alert>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader
        title="Панель партнёра"
        subtitle="Витрина для технопарков и Минцифры: как платформа помогает трудоустройству и качеству исполнения."
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
                    onChange={(e) => setNewOrgType(e.target.value as any)}
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
                    {orgs.slice(0, 10).map((o) => (
                      <div key={o.id} className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                        <div className="text-sm font-medium truncate">{o.name}</div>
                        <div className="mt-1 text-xs text-[#9FB0D0]">{o.type}</div>
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

