import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, ArrowRight, RefreshCw, Sparkles } from 'lucide-react'

import { createProject, getHealth, listProjects, type ProjectOut } from '@/api/client'
import { Page, PageHeader, TwoCol } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/utils/errors'

export default function Workspace() {
  const [health, setHealth] = useState<{ ok: boolean; text: string } | null>(null)
  const [projects, setProjects] = useState<ProjectOut[]>([])
  const [lastProject, setLastProject] = useState<ProjectOut | null>(null)
  const [loadingProjects, setLoadingProjects] = useState(true)

  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

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
    return () => { alive = false }
  }, [])

  function loadProjects() {
    setLoadingProjects(true)
    listProjects()
      .then(setProjects)
      .catch(() => {/* silently ignore on dashboard */})
      .finally(() => setLoadingProjects(false))
  }

  useEffect(() => { loadProjects() }, [])

  const quickActions = useMemo(
    () => [
      {
        title: 'Создать артефакт',
        subtitle: 'Digital Artifact как единица закрытия',
        to: '/knowledge/new',
      },
      {
        title: 'Обновить компетенцию',
        subtitle: 'Evidence-based skill update',
        to: '/talent',
      },
      {
        title: 'Посчитать Success Rate',
        subtitle: '360° scoring в один запрос',
        to: '/admin',
      },
    ],
    [],
  )

  return (
    <Page>
      <PageHeader
        title="Workspace"
        subtitle="Глобальный обзор: быстрые действия, проверки интеграции и последние результаты."
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
                  <div className="text-sm font-medium">Быстрые действия</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  {quickActions.map((a) => (
                    <Link
                      key={a.to}
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

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#3DDC97]" />
                  <div className="text-sm font-medium">Создать проект</div>
                </div>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setErr(null)
                    const v = title.trim()
                    if (!v) return
                    setBusy(true)
                    try {
                      const created = await createProject({ title: v })
                      setLastProject(created)
                      setProjects((prev) => [created, ...prev])
                      setTitle('')
                    } catch (e: unknown) {
                      setErr(getErrorMessage(e, 'Не удалось создать проект'))
                    } finally {
                      setBusy(false)
                    }
                  }}
                >
                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">Название проекта</div>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Например: PoM + Artifact Vault MVP"
                    />
                  </div>
                  {err ? <Alert tone="danger">{err}</Alert> : null}
                  <Button variant="primary" type="submit" disabled={busy}>
                    {busy ? 'Создаю…' : 'Создать проект'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        }
        aside={
          <div className="space-y-4">
            {lastProject ? (
              <Card>
                <CardHeader>
                  <div className="text-sm font-medium">Только что создан</div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">{lastProject.title}</div>
                    <div className="text-xs text-[#9FB0D0]">id: {lastProject.id}</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="accent">status: {lastProject.status}</Badge>
                      {lastProject.success_rate != null ? (
                        <Badge tone="success">
                          success: {lastProject.success_rate.toFixed(2)}
                        </Badge>
                      ) : (
                        <Badge>success: n/a</Badge>
                      )}
                    </div>
                    <Link to="/admin" className="text-sm text-[#6C8CFF] hover:underline">
                      Пересчитать scoring
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Последние проекты</div>
                  <button
                    type="button"
                    onClick={loadProjects}
                    className="rounded p-1 text-[#9FB0D0] hover:text-[#EAF0FF] transition"
                    title="Обновить"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingProjects ? (
                  <div className="text-sm text-[#9FB0D0]">Загружаю…</div>
                ) : projects.length === 0 ? (
                  <div className="text-sm text-[#9FB0D0]">Нет проектов</div>
                ) : (
                  <div className="space-y-2">
                    {projects.slice(0, 5).map((p) => (
                      <div key={p.id} className="rounded-lg bg-[#0F1830] p-2 ring-1 ring-[#1E2A44]">
                        <div className="text-sm font-medium truncate">{p.title}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge tone="accent">{p.status}</Badge>
                          {p.success_rate != null ? (
                            <Badge tone="success">{(p.success_rate * 100).toFixed(0)}%</Badge>
                          ) : null}
                        </div>
                      </div>
                    ))}
                    {projects.length > 5 ? (
                      <div className="text-xs text-[#9FB0D0]">
                        +{projects.length - 5} ещё
                      </div>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-sm font-medium">Подсказка</div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-[#9FB0D0]">
                  Для полноценной работы поднимите Postgres через Docker:{' '}
                  <code className="text-xs">docker-compose up -d</code>
                </div>
              </CardContent>
            </Card>
          </div>
        }
      />
    </Page>
  )
}
