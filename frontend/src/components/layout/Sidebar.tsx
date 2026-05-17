import {
  BookOpen,
  Briefcase,
  MoreHorizontal,
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
  visibleFor?: Array<'client' | 'student' | 'mentor' | 'admin'>
}

const items: Item[] = [
  { to: '/', label: 'Главная', icon: <LayoutGrid className="h-4 w-4" /> },
  { to: '/tasks', label: 'Задачи', icon: <Briefcase className="h-4 w-4" /> },
  { to: '/profile', label: 'Профиль', icon: <Settings className="h-4 w-4" /> },
  { to: '/more', label: 'Ещё', icon: <MoreHorizontal className="h-4 w-4" /> },
]

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  return (
    <aside className="hidden w-[260px] shrink-0 md:block">
      <div className="rounded-xl bg-[#111A2E] ring-1 ring-[#1E2A44]">
        <div className="border-b border-[#1E2A44] px-4 py-3">
          <div className="text-xs text-[#9FB0D0]">Навигация</div>
        </div>
        <nav className="p-2">
          {items
            .filter((i) => {
              if (!i.visibleFor) return true
              if (!role) return false
              return i.visibleFor.includes(role)
            })
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
