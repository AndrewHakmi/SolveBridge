import {
  BookOpen,
  Briefcase,
  Building2,
  GraduationCap,
  LayoutGrid,
  MoreHorizontal,
  Settings,
  Shield,
  ShieldCheck,
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
  visibleFor?: Array<'client' | 'student' | 'executor' | 'mentor' | 'admin' | 'partner' | 'company'>
}

const navItems: Item[] = [
  { to: '/', label: 'Главная', icon: <LayoutGrid className="h-4 w-4" /> },
  { to: '/tasks', label: 'Задачи', icon: <Briefcase className="h-4 w-4" /> },
  { to: '/profile', label: 'Профиль', icon: <Settings className="h-4 w-4" /> },
  {
    to: '/cabinet',
    label: 'Кабинет',
    icon: <ShieldCheck className="h-4 w-4" />,
    visibleFor: ['admin'],
  },
  {
    to: '/partner-cabinet',
    label: 'Кабинет',
    icon: <ShieldCheck className="h-4 w-4" />,
    visibleFor: ['partner'],
  },
  {
    to: '/company-cabinet',
    label: 'Кабинет',
    icon: <Building2 className="h-4 w-4" />,
    visibleFor: ['company'],
  },
]

const extraItems: Item[] = [
  { to: '/knowledge', label: 'Портфолио', icon: <BookOpen className="h-4 w-4" /> },
  { to: '/talent', label: 'Навыки', icon: <Users className="h-4 w-4" /> },
  { to: '/learning', label: 'Обучение', icon: <GraduationCap className="h-4 w-4" /> },
  {
    to: '/admin',
    label: 'Инструменты',
    icon: <Shield className="h-4 w-4" />,
    visibleFor: ['client', 'mentor', 'admin'],
  },
  {
    to: '/partner',
    label: 'Панель управления партнёрами',
    icon: <Shield className="h-4 w-4" />,
    visibleFor: ['admin'],
  },
]

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  function filter(items: Item[]) {
    return items.filter((i) => {
      if (!i.visibleFor) return true
      if (!role) return false
      return i.visibleFor.includes(role)
    })
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
      'hover:bg-[#132042] hover:ring-1 hover:ring-[#1E2A44]',
      isActive && 'bg-[#0F1830] ring-1 ring-[#6C8CFF]/30',
    )

  return (
    <aside className="hidden w-[260px] shrink-0 md:block">
      <div className="rounded-xl bg-[#111A2E] ring-1 ring-[#1E2A44]">
        <div className="border-b border-[#1E2A44] px-4 py-3">
          <div className="text-xs text-[#9FB0D0]">Навигация</div>
        </div>
        <nav className="p-2">
          {filter(navItems).map((i) => (
            <NavLink key={i.to} to={i.to} end={i.to === '/'} className={linkClass}>
              <span className="text-[#9FB0D0]">{i.icon}</span>
              <span>{i.label}</span>
            </NavLink>
          ))}

          <div className="my-2 border-t border-[#1E2A44]" />

          {filter(extraItems).map((i) => (
            <NavLink key={i.to} to={i.to} className={linkClass}>
              <span className="text-[#9FB0D0]">{i.icon}</span>
              <span>{i.label}</span>
            </NavLink>
          ))}

          <div className="my-2 border-t border-[#1E2A44]" />

          <NavLink to="/more" className={linkClass}>
            <span className="text-[#9FB0D0]"><MoreHorizontal className="h-4 w-4" /></span>
            <span>Ещё</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  )
}
