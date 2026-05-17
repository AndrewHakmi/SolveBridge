import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { createUser } from '@/api/client'
import { Alert } from '@/components/ui/Alert'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { labelForRole, useAuthStore, type UserRole } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/errors'

const roleOptions: Array<{ value: UserRole; hint: string }> = [
  { value: 'student', hint: 'Найти задачу и заработать' },
  { value: 'client', hint: 'Поставить задачу и получить результат' },
  { value: 'mentor', hint: 'Помогать студентам и следить за качеством' },
  { value: 'admin', hint: 'Для технопарков/Минцифры: метрики и партнёры' },
]

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null
    return state?.from || '/'
  }, [location.state])

  return (
    <div className="min-h-full">
      <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-[1320px] items-center justify-center px-4 py-10">
        <Card className="w-full max-w-[520px] overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#6C8CFF] via-[#3DDC97] to-[#FF5A6A]" />
          <CardHeader className="space-y-1">
            <div className="text-sm text-[#9FB0D0]">Talent & Knowledge OS</div>
            <div className="text-2xl font-semibold tracking-tight">Вход</div>
            <div className="text-sm text-[#9FB0D0]">Введите email и выберите роль</div>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault()
                setErr(null)
                const vEmail = email.trim().toLowerCase()
                const trimmed = name.trim()
                if (!vEmail) return
                if (!trimmed) return
                setBusy(true)
                try {
                  const created = await createUser({ email: vEmail, display_name: trimmed })
                  login({ id: created.id, email: created.email, name: trimmed, role })
                  navigate(from)
                } catch (e: unknown) {
                  setErr(getErrorMessage(e, 'Не удалось войти'))
                } finally {
                  setBusy(false)
                }
              }}
            >
              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">Email</div>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.ru"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>

              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">Имя</div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Анна"
                  autoFocus
                />
              </div>

              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">Роль</div>
                <div className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                  <select
                    className="w-full rounded-lg bg-[#111A2E] px-3 py-2 text-sm ring-1 ring-[#1E2A44] outline-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                  >
                    {roleOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {labelForRole(o.value)}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 text-xs text-[#9FB0D0]">
                    {roleOptions.find((o) => o.value === role)?.hint}
                  </div>
                </div>
              </div>

              {err ? <Alert tone="danger">{err}</Alert> : null}

              <Button variant="primary" type="submit" className="w-full" disabled={busy}>
                {busy ? 'Вхожу…' : 'Войти'}
              </Button>
              <div className="text-xs text-[#9FB0D0]">
                Это MVP-логин. Пользователь создаётся в базе по email (для корректной работы заявок/назначений).
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
