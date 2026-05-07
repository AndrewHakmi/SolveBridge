import {
  BookOpen,
  GraduationCap,
  LayoutGrid,
  Settings,
  Shield,
  Users,
} from 'lucide-react'
import { type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

type Item = {
  to: string
  label: string
  icon: ReactNode
  requireAdmin?: boolean
}

const items: Item[] = [
  { to: '/', label: 'Workspace', icon: <LayoutGrid className="h-4 w-4" /> },
  { to: '/knowledge', label: 'База знаний', icon: <BookOpen className="h-4 w-4" /> },
  { to: '/talent', label: 'Таланты', icon: <Users className="h-4 w-4" /> },
  { to: '/learning', label: 'Обучение', icon: <GraduationCap className="h-4 w-4" /> },
  { to: '/profile', label: 'Профиль', icon: <Settings className="h-4 w-4" /> },
  { to: '/admin', label: 'Админ', icon: <Shield className="h-4 w-4" />, requireAdmin: true },
]

export function Sidebar() {
  const user = useAuthStore((s) => s.user)

  return (
    <aside className="hidden w-[260px] shrink-0 md:block">
      <div className="rounded-xl bg-[#111A2E] ring-1 ring-[#1E2A44]">
        <div className="border-b border-[#1E2A44] px-4 py-3">
          <div className="text-xs text-[#9FB0D0]">Навигация</div>
        </div>
        <nav className="p-2">
          {items
            .filter((i) => (i.requireAdmin ? user?.role === 'admin' : true))
            .map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
                    'hover:bg-[#132042] hover:ring-1 hover:ring-[#1E2A44]',
                    isActive && 'bg-[#0F1830] ring-1 ring-[#6C8CFF]/30',
                  )
                }
                end={i.to === '/'}
              >
                <span className="text-[#9FB0D0]">{i.icon}</span>
                <span>{i.label}</span>
              </NavLink>
            ))}
        </nav>
      </div>
    </aside>
  )
}
