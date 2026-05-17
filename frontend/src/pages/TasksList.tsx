import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Plus, RefreshCw } from 'lucide-react'

import { listTasks, type TaskOut } from '@/api/client'
import { Page, PageHeader } from '@/components/layout/Page'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useAuthStore } from '@/stores/authStore'

function toneForStatus(status: string) {
  if (status === 'open') return 'accent'
  if (status === 'assigned') return 'success'
  if (status === 'disputed') return 'danger'
  return 'neutral'
}

export default function TasksList() {
  const user = useAuthStore((s) => s.user)
  const canCreate = user?.role === 'client' || user?.role === 'admin'

  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<TaskOut[]>([])

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'Все' },
      { value: 'open', label: 'Открытые' },
      { value: 'assigned', label: 'Назначенные' },
      { value: 'disputed', label: 'Диспут' },
      { value: 'completed', label: 'Завершённые' },
    ],
    [],
  )

  async function load() {
    setLoading(true)
    try {
      const data = await listTasks(status ? { status } : undefined)
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [status])

  return (
    <Page>
      <PageHeader
        title="Задачи"
        subtitle="Биржа задач с диспутами (SLA 48ч) и базовой моделью назначений/заявок."
        right={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              className="rounded-lg p-2 text-[#9FB0D0] transition hover:bg-[#132042] hover:text-[#EAF0FF]"
              title="Обновить"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            {canCreate ? (
              <Link to="/tasks/new">
                <Button variant="primary">
                  <Plus className="h-4 w-4" />
                  Создать задачу
                </Button>
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-xl bg-[#111A2E] px-3 py-2 ring-1 ring-[#1E2A44]">
          <Filter className="h-4 w-4 text-[#9FB0D0]" />
          <div className="text-sm">Статус</div>
          <select
            className="rounded-lg bg-[#0F1830] px-2 py-1 text-sm ring-1 ring-[#1E2A44] outline-none"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-[#9FB0D0]">Загружаю…</div>
      ) : items.length === 0 ? (
        <Card>
          <CardHeader>
            <div className="text-sm font-medium">Пока нет задач</div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-[#9FB0D0]">
              Создай первую задачу, или переключись на роль студента, чтобы подать заявку.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {items.map((t) => (
            <Link key={t.id} to={`/tasks/${t.id}`} className="group">
              <Card className="transition group-hover:ring-[#6C8CFF]/30">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{t.title}</div>
                      <div className="mt-1 truncate text-xs text-[#9FB0D0]">
                        {t.category}
                        {t.budget_amount_rub != null ? ` · ${t.budget_amount_rub.toLocaleString('ru-RU')} ₽` : ''}
                      </div>
                    </div>
                    <Badge tone={toneForStatus(t.status)}>{t.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="line-clamp-2 text-sm text-[#9FB0D0]">{t.description}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Page>
  )
}

