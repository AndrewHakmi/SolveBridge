import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus } from 'lucide-react'

import {
  createOrganization,
  createTask,
  listOrganizations,
  type OrganizationOut,
} from '@/api/client'
import { Page, PageHeader } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/errors'

export default function TaskNew() {
  const user = useAuthStore((s) => s.user)
  const canCreate = user?.role === 'client' || user?.role === 'admin'
  const navigate = useNavigate()

  const [orgs, setOrgs] = useState<OrganizationOut[]>([])
  const [orgId, setOrgId] = useState('')
  const [orgName, setOrgName] = useState('')
  const [orgBusy, setOrgBusy] = useState(false)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('qa')
  const [budget, setBudget] = useState<string>('')
  const [description, setDescription] = useState('')

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const categories = useMemo(
    () => [
      { value: 'qa', label: 'QA (manual/regression)' },
      { value: 'data_labeling', label: 'Data labeling' },
      { value: 'frontend', label: 'Базовый фронтенд' },
      { value: 'docs', label: 'Тех. документация' },
      { value: 'parsing', label: 'Парсинг данных' },
    ],
    [],
  )

  useEffect(() => {
    listOrganizations({ type: 'company' })
      .then((rows) => {
        setOrgs(rows)
        if (!orgId && rows.length) setOrgId(rows[0].id)
      })
      .catch(() => {})
  }, [])

  if (!canCreate) {
    return (
      <Page>
        <PageHeader title="Создать задачу" subtitle="Доступно для роли Клиент/Админ." />
        <Alert tone="danger">Недостаточно прав. Переключи роль на «Клиент».</Alert>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader title="Создать задачу" subtitle="MVP поток: компания → задача → заявки → назначение → диспут (SLA 48ч)." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#6C8CFF]" />
              <div className="text-sm font-medium">Компания (заказчик)</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="mb-1 text-xs text-[#9FB0D0]">Выбрать</div>
              <select
                className="w-full rounded-xl bg-[#0F1830] px-3 py-2 text-sm ring-1 ring-[#1E2A44] outline-none"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
              >
                {orgs.length === 0 ? <option value="">Нет компаний</option> : null}
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
              <div className="text-xs text-[#9FB0D0]">Или создать новую</div>
              <div className="mt-2 flex gap-2">
                <Input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Например: ООО «Рамеева Софт»"
                />
                <Button
                  variant="secondary"
                  disabled={orgBusy || !orgName.trim()}
                  onClick={async () => {
                    setErr(null)
                    const name = orgName.trim()
                    if (!name) return
                    setOrgBusy(true)
                    try {
                      const created = await createOrganization({ type: 'company', name })
                      setOrgs((prev) => [created, ...prev])
                      setOrgId(created.id)
                      setOrgName('')
                    } catch (e: unknown) {
                      setErr(getErrorMessage(e, 'Не удалось создать компанию'))
                    } finally {
                      setOrgBusy(false)
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-sm font-medium">Детали задачи</div>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault()
                setErr(null)
                const vTitle = title.trim()
                const vDesc = description.trim()
                if (!orgId) return setErr('Выбери или создай компанию')
                if (!vTitle) return setErr('Заполни название задачи')
                if (!vDesc) return setErr('Заполни описание')

                setBusy(true)
                try {
                  const created = await createTask({
                    organization_id: orgId,
                    title: vTitle,
                    description: vDesc,
                    category,
                    budget_amount_rub: budget.trim() ? Number(budget) : null,
                    required_skills: [],
                  })
                  navigate(`/tasks/${created.id}`)
                } catch (e: unknown) {
                  setErr(getErrorMessage(e, 'Не удалось создать задачу'))
                } finally {
                  setBusy(false)
                }
              }}
            >
              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">Название</div>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Ручной регресс личного кабинета" />
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs text-[#9FB0D0]">Категория</div>
                  <select
                    className="w-full rounded-xl bg-[#0F1830] px-3 py-2 text-sm ring-1 ring-[#1E2A44] outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="mb-1 text-xs text-[#9FB0D0]">Бюджет (₽)</div>
                  <Input
                    value={budget}
                    onChange={(e) => setBudget(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="10000"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">Описание</div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Контекст, критерии готовности, ограничения (не prod), как сдавать результат…"
                />
              </div>

              {err ? <Alert tone="danger">{err}</Alert> : null}
              <Button variant="primary" type="submit" disabled={busy}>
                {busy ? 'Создаю…' : 'Создать задачу'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Page>
  )
}

