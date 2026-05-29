import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Pencil, Sparkles, X } from 'lucide-react'

import { listOrganizations, listPlans, listTasks } from '@/api/client'
import { Page, TwoCol } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/errors'

type BannerData = { imageUrl: string; text: string }

function loadBanner(): BannerData {
  try {
    const saved = localStorage.getItem('sb:banner')
    if (saved) return JSON.parse(saved) as BannerData
  } catch (e) {
    void e
  }
  return { imageUrl: '', text: 'Добро пожаловать в Проекторию — платформу задач и знаний' }
}

export default function Workspace() {
  const user = useAuthStore((s) => s.user)
  const [err, setErr] = useState<string | null>(null)

  const [stats, setStats] = useState<{
    openTasks: number
    assignedTasks: number
    disputedTasks: number
    companies: number
    plans: number
  } | null>(null)

  const [banner, setBanner] = useState<BannerData>(loadBanner)
  const [editingBanner, setEditingBanner] = useState(false)
  const [draft, setDraft] = useState<BannerData>(banner)

  function openEdit() {
    setDraft(banner)
    setEditingBanner(true)
  }

  function saveBanner() {
    setBanner(draft)
    localStorage.setItem('sb:banner', JSON.stringify(draft))
    setEditingBanner(false)
  }

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
    if (role === 'student' || role === 'executor') {
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
      <TwoCol
        main={
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#6C8CFF]" />
                  <div className="text-xs font-semibold uppercase tracking-wider">С чего начать</div>
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
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#3DDC97]" />
                  <div className="text-xs font-semibold uppercase tracking-wider">Сейчас в системе</div>
                </div>
              </CardHeader>
              <CardContent>
                {!stats ? (
                  <div className="text-sm text-[#9FB0D0]">Загружаю…</div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-[#0F1830] p-2 text-center ring-1 ring-[#1E2A44]">
                        <div className="text-[10px] text-[#9FB0D0]">Открыто</div>
                        <div className="mt-1 text-lg font-semibold">{stats.openTasks}</div>
                      </div>
                      <div className="rounded-xl bg-[#0F1830] p-2 text-center ring-1 ring-[#1E2A44]">
                        <div className="text-[10px] text-[#9FB0D0]">Назнач.</div>
                        <div className="mt-1 text-lg font-semibold">{stats.assignedTasks}</div>
                      </div>
                      <div className="rounded-xl bg-[#0F1830] p-2 text-center ring-1 ring-[#1E2A44]">
                        <div className="text-[10px] text-[#9FB0D0]">Диспут</div>
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

          </div>
        }
      />

      {/* Fixed banner at viewport bottom, aligned to content container */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="mx-auto max-w-[1600px] px-6">
        <div
          className="relative min-h-[180px] overflow-hidden rounded-xl ring-1 ring-[#1E2A44]"
          style={
            banner.imageUrl
              ? {
                  backgroundImage: `linear-gradient(rgba(11,18,32,0.55),rgba(11,18,32,0.6)),url(${JSON.stringify(banner.imageUrl)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : { background: '#111A2E' }
          }
        >
          {!editingBanner ? (
            <>
              <div className="flex min-h-[180px] items-center justify-center px-8 py-6">
                <p className="max-w-2xl text-center text-xl font-semibold leading-snug text-white drop-shadow">
                  {banner.text || <span className="text-[#9FB0D0]">Добавьте текст баннера</span>}
                </p>
              </div>
              <button
                type="button"
                onClick={openEdit}
                className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg bg-[#0B1220]/80 px-3 py-1.5 text-xs text-[#9FB0D0] ring-1 ring-[#1E2A44] transition hover:text-white"
              >
                <Pencil className="h-3.5 w-3.5" />
                Изменить
              </button>
            </>
          ) : (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium">Редактирование баннера</span>
                <button
                  type="button"
                  onClick={() => setEditingBanner(false)}
                  className="rounded-lg p-1 text-[#9FB0D0] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs text-[#9FB0D0]">Изображение (URL)</div>
                  <Input
                    value={draft.imageUrl}
                    onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <div className="mb-1 text-xs text-[#9FB0D0]">Текст</div>
                  <Input
                    value={draft.text}
                    onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                    placeholder="Добро пожаловать!"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="primary" type="button" onClick={saveBanner}>
                  Сохранить
                </Button>
                <Button variant="ghost" type="button" onClick={() => setEditingBanner(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </Page>
  )
}
