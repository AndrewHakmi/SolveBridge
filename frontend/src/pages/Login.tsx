import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore, type UserRole } from '@/stores/authStore'

function labelForRole(role: UserRole) {
  if (role === 'employee') return 'Сотрудник'
  if (role === 'manager') return 'Руководитель'
  return 'HR/Администратор'
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('employee')

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
            <div className="text-sm text-[#9FB0D0]">
              Доступ к корпоративным знаниям и развитию
            </div>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                const trimmed = name.trim()
                if (!trimmed) return
                login({ id: crypto.randomUUID(), name: trimmed, role })
                navigate(from)
              }}
            >
              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">Имя</div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Анна Петрова"
                  autoFocus
                />
              </div>

              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">Роль</div>
                <div className="grid grid-cols-3 gap-2">
                  {(['employee', 'manager', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={
                        'rounded-lg px-3 py-2 text-sm ring-1 transition ' +
                        (role === r
                          ? 'bg-[#0F1830] text-[#EAF0FF] ring-[#6C8CFF]/35'
                          : 'bg-[#111A2E] text-[#9FB0D0] ring-[#1E2A44] hover:bg-[#132042]')
                      }
                    >
                      {labelForRole(r)}
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="primary" type="submit" className="w-full">
                Войти
              </Button>
              <div className="text-xs text-[#9FB0D0]">
                Это демо-логин. Реальную аутентификацию подключим позже.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

