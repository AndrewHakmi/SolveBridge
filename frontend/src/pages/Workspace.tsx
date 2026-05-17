import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'

import { getHealth, listOrganizations, listPlans, listTasks } from '@/api/client'
import { Page, PageHeader, TwoCol } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/errors'

export default function Workspace() {
  const user = useAuthStore((s) => s.user)
  const [health, setHealth] = useState<{ ok: boolean; text: string } | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const [stats, setStats] = useState<{
    openTasks: number
    assignedTasks: number
    disputedTasks: number
    companies: number
    plans: number
  } | null>(null)

  useEffect(() => {
    let alive = true
    const started = performance.now()
    getHealth()
      .then((r) => {
        if (!alive) return
        const ms = Math.round(performance.now() - started)
        setHealth({ ok: r.status === 'ok', text: `API: ${r.status} · ${ms}ms` })
      })
      .catch(() => {
        if (!alive) return
        setHealth({ ok: false, text: 'API: недоступен (проверь backend на :8000)' })
      })
    return () => {
      alive = false
    }
  }, [])

  async function loadStats() {
    setErr(null)
    try {
      const [tasks, companies, plans] = await Promise.all([
        listTasks().catch(() => []),
        listOrganizations({ type: 'company' }).catch(() => []),
        listPlans().catch(() => []),
      ])
      setStats({
        openTasks: tasks.filter((t) => t.status === 'open').length,
        assignedTasks: tasks.filter((t) => t.status === 'assigned').length,
        disputedTasks: tasks.filter((t) => t.status === 'disputed').length,
        companies: companies.length,
        plans: plans.length,
      })
    } catch (e: unknown) {
      setErr(getErrorMessage(e, 'Не удалось загрузить данные'))
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const quickActions = useMemo(() => {
    const role = user?.role
    if (role === 'student') {
      return [
        { title: 'Найти задачу', subtitle: 'Выбери задачу и откликнись', to: '/tasks' },
        { title: 'Мои результаты', subtitle: 'Портфолио (артефакты)', to: '/knowledge' },
      ]
    }
    if (role === 'mentor') {
      return [
        { title: 'Задачи', subtitle: 'Помочь довести до результата', to: '/tasks' },
        { title: 'Инструменты', subtitle: 'PoM и качество', to: '/admin' },
      ]
    }
    if (role === 'admin') {
      return [
        { title: 'Панель партнёра', subtitle: 'Метрики и партнёры', to: '/partner' },
        { title: 'Задачи', subtitle: 'Список задач', to: '/tasks' },
      ]
    }
    return [
      { title: 'Создать задачу', subtitle: 'Коротко и по делу', to: '/tasks/new' },
      { title: 'Мои задачи', subtitle: 'Заявки, назначение, статус', to: '/tasks' },
    ]
  }, [user?.role])

  return (
    <Page>
      <PageHeader
        title="Главная"
        subtitle="Понятный старт: что делать дальше, в зависимости от вашей роли."
        right={
          health ? (
            <Badge tone={health.ok ? 'success' : 'danger'}>{health.text}</Badge>
          ) : (
            <Badge>Проверяю API…</Badge>
          )
        }
      />

      <TwoCol
        main={
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#6C8CFF]" />
                  <div className="text-sm font-medium">С чего начать</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {quickActions.map((a) => (
                    <Link
                      key={a.to + a.title}
                      to={a.to}
                      className="group rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44] transition hover:bg-[#132042]"
                    >
                      <div className="text-sm font-medium">{a.title}</div>
                      <div className="mt-1 text-xs text-[#9FB0D0]">{a.subtitle}</div>
                      <div className="mt-2 inline-flex items-center gap-1 text-xs text-[#6C8CFF]">
                        Открыть
                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {err ? <Alert tone="danger">{err}</Alert> : null}
          </div>
        }
        aside={
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#3DDC97]" />
                  <div className="text-sm font-medium">Сейчас в системе</div>
                </div>
              </CardHeader>
              <CardContent>
                {!stats ? (
                  <div className="text-sm text-[#9FB0D0]">Загружаю…</div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                        <div className="text-xs text-[#9FB0D0]">Открыто</div>
                        <div className="mt-1 text-lg font-semibold">{stats.openTasks}</div>
                      </div>
                      <div className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                        <div className="text-xs text-[#9FB0D0]">Назначено</div>
                        <div className="mt-1 text-lg font-semibold">{stats.assignedTasks}</div>
                      </div>
                      <div className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                        <div className="text-xs text-[#9FB0D0]">Диспут</div>
                        <div className="mt-1 text-lg font-semibold">{stats.disputedTasks}</div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Компании</div>
                        <Badge tone="accent">{stats.companies}</Badge>
                      </div>
                      <div className="mt-1 text-xs text-[#9FB0D0]">Заказчики</div>
                    </div>

                    <div className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Тарифы</div>
                        <Badge>{stats.plans}</Badge>
                      </div>
                      <div className="mt-1 text-xs text-[#9FB0D0]">Уровни сервиса</div>
                    </div>

                    <Button variant="secondary" type="button" onClick={loadStats}>
                      Обновить данные
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#3DDC97]" />
                  <div className="text-sm font-medium">Короткая подсказка</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-[#9FB0D0]">
                  <div className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                    Студентам: открой «Задачи» → выбери → нажми «Откликнуться».
                  </div>
                  <div className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                    Партнёрам: открой «Ещё» → «Панель партнёра».
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        }
      />
    </Page>
  )
}
