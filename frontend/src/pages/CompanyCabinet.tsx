import { useState } from 'react'
import { Briefcase, Building2, ArrowRight, UserCheck, UserMinus, Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'

import { createUser } from '@/api/client'
import { Page, PageHeader } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/errors'
import { getAllCompanyCreds } from '@/utils/partnerCreds'
import { getMentors, addMentor, removeMentor, type MentorEntry } from '@/utils/mentorRegistry'

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
      addMentor({
        userId: created.id,
        email: vEmail,
        name: vName,
        password: mentorPassword,
        assignedBy: assignerEmail,
        assignedAt: new Date().toISOString(),
      })
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

export default function CompanyCabinet() {
  const user = useAuthStore((s) => s.user)
  const cred = user?.email ? getAllCompanyCreds()[user.email] : null

  return (
    <Page>
      <PageHeader
        title="Кабинет компании"
        subtitle="Управление задачами и доступ к платформе Проектория."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center gap-2">
              <Building2 className="h-4 w-4 text-[#6C8CFF]" />
              <div className="text-xs font-semibold uppercase tracking-wider">Ваша компания</div>
            </div>
          </CardHeader>
          <CardContent>
            {cred ? (
              <div className="space-y-2">
                <div className="rounded-xl bg-[#0F1830] px-4 py-3 ring-1 ring-[#1E2A44]">
                  <div className="text-xs text-[#9FB0D0]">Название</div>
                  <div className="mt-1 text-lg font-semibold">{cred.companyName}</div>
                </div>
                <div className="rounded-xl bg-[#0F1830] px-4 py-3 ring-1 ring-[#1E2A44]">
                  <div className="text-xs text-[#9FB0D0]">Логин</div>
                  <div className="mt-1 text-sm">{user?.email}</div>
                </div>
                <Badge tone="success">Доступ активен</Badge>
              </div>
            ) : (
              <div className="text-sm text-[#9FB0D0]">
                Данные компании не найдены. Обратитесь к партнёру-куратору.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center gap-2">
              <Briefcase className="h-4 w-4 text-[#3DDC97]" />
              <div className="text-xs font-semibold uppercase tracking-wider">Что доступно</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { title: 'Создать задачу', desc: 'Разместите задачу для студентов', to: '/tasks/new' },
                { title: 'Мои задачи', desc: 'Статус и результаты задач', to: '/tasks' },
                { title: 'База талантов', desc: 'Найдите подходящих исполнителей', to: '/talent' },
                { title: 'Знания', desc: 'Артефакты и учебные материалы', to: '/knowledge' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group flex items-center justify-between rounded-xl bg-[#0F1830] px-4 py-3 ring-1 ring-[#1E2A44] transition hover:bg-[#132042]"
                >
                  <div>
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="mt-0.5 text-xs text-[#9FB0D0]">{item.desc}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#6C8CFF] transition group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {user?.email && <MentorRegistrationPanel assignerEmail={user.email} />}
    </Page>
  )
}
