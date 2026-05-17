import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Gavel, UserPlus } from 'lucide-react'

import {
  applyToTask,
  assignTask,
  getTask,
  getTaskAssignment,
  listUsers,
  listDisputes,
  listTaskApplications,
  openDispute,
  type DisputeOut,
  type TaskApplicationOut,
  type TaskAssignmentOut,
  type TaskOut,
} from '@/api/client'
import { Page, PageHeader, TwoCol } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/errors'

function toneForStatus(status: string) {
  if (status === 'open') return 'accent'
  if (status === 'assigned') return 'success'
  if (status === 'disputed') return 'danger'
  return 'neutral'
}

export default function TaskDetail() {
  const { id } = useParams()
  const user = useAuthStore((s) => s.user)

  const [userIndex, setUserIndex] = useState<Record<string, { name: string; email: string }>>({})
  const [task, setTask] = useState<TaskOut | null>(null)
  const [assignment, setAssignment] = useState<TaskAssignmentOut | null>(null)
  const [apps, setApps] = useState<TaskApplicationOut[]>([])
  const [disputes, setDisputes] = useState<DisputeOut[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const [applyMessage, setApplyMessage] = useState('')
  const [applyBudget, setApplyBudget] = useState('')
  const [busyApply, setBusyApply] = useState(false)

  const [mentorId, setMentorId] = useState('')
  const [busyAssign, setBusyAssign] = useState(false)

  const [disputeReason, setDisputeReason] = useState('')
  const [busyDispute, setBusyDispute] = useState(false)

  const canApply = user?.role === 'student'
  const canManage = user?.role === 'client' || user?.role === 'admin'

  const taskId = id || ''

  const applicantId = user?.id || ''

  const selectedExecutor = useMemo(() => apps[0]?.applicant_id || '', [apps])

  function displayUser(userId: string) {
    const u = userIndex[userId]
    if (!u) return `Пользователь ${userId.slice(0, 6)}…`
    return u.name || u.email
  }

  async function load() {
    if (!taskId) return
    setLoading(true)
    setErr(null)
    try {
      const [t, a, d, ap, users] = await Promise.all([
        getTask(taskId),
        getTaskAssignment(taskId),
        listDisputes(taskId).catch(() => [] as DisputeOut[]),
        listTaskApplications(taskId).catch(() => [] as TaskApplicationOut[]),
        listUsers().catch(() => []),
      ])
      setTask(t)
      setAssignment(a)
      setDisputes(d)
      setApps(ap)
      const idx: Record<string, { name: string; email: string }> = {}
      for (const u of users) {
        idx[u.id] = { name: u.display_name || u.email, email: u.email }
      }
      setUserIndex(idx)
    } catch (e: unknown) {
      setErr(getErrorMessage(e, 'Не удалось загрузить задачу'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [taskId])

  if (!taskId) {
    return (
      <Page>
        <Alert tone="danger">Некорректный id</Alert>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader
        title={task ? task.title : 'Задача'}
        subtitle={task ? task.category : '…'}
        right={task ? <Badge tone={toneForStatus(task.status)}>{task.status}</Badge> : null}
      />

      {err ? <Alert tone="danger">{err}</Alert> : null}

      {loading || !task ? (
        <div className="text-sm text-[#9FB0D0]">Загружаю…</div>
      ) : (
        <TwoCol
          main={
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="text-sm font-medium">Описание</div>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm text-[#9FB0D0]">{task.description}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge>{task.category}</Badge>
                    {task.budget_amount_rub != null ? (
                      <Badge tone="accent">{task.budget_amount_rub.toLocaleString('ru-RU')} ₽</Badge>
                    ) : (
                      <Badge>бюджет: n/a</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {canApply ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-[#6C8CFF]" />
                      <div className="text-sm font-medium">Откликнуться</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form
                      className="space-y-3"
                      onSubmit={async (e) => {
                        e.preventDefault()
                        setErr(null)
                        if (!applicantId) return
                        setBusyApply(true)
                        try {
                          await applyToTask(taskId, {
                            applicant_id: applicantId,
                            proposed_amount_rub: applyBudget.trim() ? Number(applyBudget) : null,
                            message: applyMessage.trim() || null,
                          })
                          setApplyMessage('')
                          setApplyBudget('')
                          await load()
                        } catch (e: unknown) {
                          setErr(getErrorMessage(e, 'Не удалось отправить отклик'))
                        } finally {
                          setBusyApply(false)
                        }
                      }}
                    >
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <div>
                          <div className="mb-1 text-xs text-[#9FB0D0]">Ставка (₽)</div>
                          <Input
                            value={applyBudget}
                            onChange={(e) => setApplyBudget(e.target.value.replace(/[^\d]/g, ''))}
                            placeholder="10000"
                            inputMode="numeric"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button variant="primary" type="submit" disabled={busyApply}>
                            {busyApply ? 'Отправляю…' : 'Откликнуться'}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-xs text-[#9FB0D0]">Сообщение</div>
                        <Textarea
                          value={applyMessage}
                          onChange={(e) => setApplyMessage(e.target.value)}
                          placeholder="Коротко: опыт, сроки, вопросы по задаче…"
                        />
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : null}

              {canManage ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#3DDC97]" />
                      <div className="text-sm font-medium">Заявки и назначение</div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {apps.length === 0 ? (
                      <div className="text-sm text-[#9FB0D0]">Пока нет откликов</div>
                    ) : (
                      <div className="space-y-2">
                        {apps.slice(0, 8).map((a) => (
                          <div
                            key={a.id}
                            className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-medium truncate">
                                {displayUser(a.applicant_id)}
                              </div>
                              <Badge tone="accent">{a.status}</Badge>
                            </div>
                            <div className="mt-1 text-xs text-[#9FB0D0]">
                              {a.proposed_amount_rub != null
                                ? `${a.proposed_amount_rub.toLocaleString('ru-RU')} ₽`
                                : 'ставка: n/a'}
                            </div>
                            {a.message ? (
                              <div className="mt-2 text-sm text-[#9FB0D0] whitespace-pre-wrap">
                                {a.message}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}

                    <form
                      className="rounded-xl bg-[#111A2E] p-3 ring-1 ring-[#1E2A44]"
                      onSubmit={async (e) => {
                        e.preventDefault()
                        setErr(null)
                        const executor = selectedExecutor
                        if (!executor) return setErr('Нет исполнителя для назначения (нужны отклики)')
                        setBusyAssign(true)
                        try {
                          await assignTask(taskId, {
                            executor_id: executor,
                            mentor_id: mentorId.trim() || null,
                          })
                          setMentorId('')
                          await load()
                        } catch (e: unknown) {
                          setErr(getErrorMessage(e, 'Не удалось назначить исполнителя'))
                        } finally {
                          setBusyAssign(false)
                        }
                      }}
                    >
                      <div className="text-xs text-[#9FB0D0]">Назначить исполнителя</div>
                      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                        <div className="md:col-span-2">
                          <div className="mb-1 text-xs text-[#9FB0D0]">ID ментора (опционально)</div>
                          <Input
                            value={mentorId}
                            onChange={(e) => setMentorId(e.target.value)}
                            placeholder="Можно оставить пустым"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button variant="primary" type="submit" disabled={busyAssign}>
                            {busyAssign ? 'Назначаю…' : 'Назначить'}
                          </Button>
                        </div>
                      </div>
                    </form>

                    {assignment ? (
                      <div className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                        <div className="text-sm font-medium">Текущее назначение</div>
                        <div className="mt-1 text-xs text-[#9FB0D0]">Исполнитель: {displayUser(assignment.executor_id)}</div>
                        <div className="mt-1 text-xs text-[#9FB0D0]">
                          Ментор: {assignment.mentor_id ? displayUser(assignment.mentor_id) : '—'}
                        </div>
                        <div className="mt-2">
                          <Badge tone="success">{assignment.status}</Badge>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          }
          aside={
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Gavel className="h-4 w-4 text-[#FF5A6A]" />
                    <div className="text-sm font-medium">Диспуты</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {disputes.length === 0 ? (
                    <div className="text-sm text-[#9FB0D0]">Нет активных диспутов</div>
                  ) : (
                    <div className="space-y-2">
                      {disputes.slice(0, 5).map((d) => (
                        <div key={d.id} className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium truncate">#{d.id.slice(0, 8)}</div>
                            <Badge tone="danger">{d.status}</Badge>
                          </div>
                          <div className="mt-1 text-xs text-[#9FB0D0]">SLA до: {new Date(d.sla_deadline).toLocaleString('ru-RU')}</div>
                          <div className="mt-2 text-sm text-[#9FB0D0] whitespace-pre-wrap">{d.reason}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <form
                    className="rounded-xl bg-[#111A2E] p-3 ring-1 ring-[#1E2A44]"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setErr(null)
                      if (!user?.id) return setErr('Нужен логин')
                      const reason = disputeReason.trim()
                      if (!reason) return setErr('Заполни причину диспута')
                      setBusyDispute(true)
                      try {
                        await openDispute(taskId, { opened_by_id: user.id, reason })
                        setDisputeReason('')
                        await load()
                      } catch (e: unknown) {
                        setErr(getErrorMessage(e, 'Не удалось открыть диспут'))
                      } finally {
                        setBusyDispute(false)
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 text-xs text-[#9FB0D0]">
                      <AlertTriangle className="h-4 w-4" />
                      SLA 48ч на разбор
                    </div>
                    <div className="mt-2">
                      <Textarea
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Опиши проблему и ожидаемое решение…"
                      />
                    </div>
                    <div className="mt-2">
                      <Button variant="secondary" type="submit" disabled={busyDispute}>
                        {busyDispute ? 'Открываю…' : 'Открыть диспут'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          }
        />
      )}
    </Page>
  )
}
