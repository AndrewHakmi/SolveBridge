import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { labelForRole, useAuthStore } from '@/stores/authStore'

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const showShellActions = location.pathname !== '/login'
  const role = user?.role
  const primaryCta =
    role === 'client' || role === 'admin'
      ? { to: '/tasks/new', label: 'Создать задачу' }
      : { to: '/tasks', label: 'Найти задачи' }

  return (
    <header className="sticky top-0 z-30 border-b border-[#1E2A44] bg-[#0B1220]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between gap-3 px-4">
        <Link to={user ? '/' : '/login'} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#6C8CFF]/20 ring-1 ring-[#6C8CFF]/30" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">Talent & Knowledge OS</div>
            <div className="text-xs text-[#9FB0D0]">SolveBridge</div>
          </div>
        </Link>

        {showShellActions && (
          <div className="flex min-w-0 flex-1 items-center justify-center">
            {user ? (
              <Link to={primaryCta.to}>
                <Button variant="primary" type="button">
                  {primaryCta.label}
                </Button>
              </Link>
            ) : null}
          </div>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button
                type="button"
                className="hidden rounded-lg px-3 py-2 text-left text-sm ring-1 ring-transparent hover:bg-[#111A2E] hover:ring-[#1E2A44] md:block"
                onClick={() => navigate('/profile')}
              >
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-[#9FB0D0]">{labelForRole(user.role)}</div>
              </button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="primary" type="button">
                Войти
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
