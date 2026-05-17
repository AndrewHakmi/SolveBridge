import { Link } from 'react-router-dom'
import { BookOpen, GraduationCap, Shield, Users } from 'lucide-react'

import { Page, PageHeader } from '@/components/layout/Page'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useAuthStore } from '@/stores/authStore'

type Item = {
  to: string
  title: string
  subtitle: string
  icon: React.ReactNode
  visibleFor?: Array<'client' | 'student' | 'mentor' | 'admin'>
}

const items: Item[] = [
  {
    to: '/knowledge',
    title: 'Портфолио',
    subtitle: 'Артефакты и результаты работы',
    icon: <BookOpen className="h-4 w-4 text-[#6C8CFF]" />,
  },
  {
    to: '/talent',
    title: 'Навыки',
    subtitle: 'Навыки и подтверждения',
    icon: <Users className="h-4 w-4 text-[#3DDC97]" />,
  },
  {
    to: '/learning',
    title: 'Обучение',
    subtitle: 'Каталог и прогресс',
    icon: <GraduationCap className="h-4 w-4 text-[#FF5A6A]" />,
  },
  {
    to: '/admin',
    title: 'Инструменты',
    subtitle: 'Скоринг, PoM и сервисные функции',
    icon: <Shield className="h-4 w-4 text-[#9FB0D0]" />,
    visibleFor: ['client', 'mentor', 'admin'],
  },
  {
    to: '/partner',
    title: 'Панель партнёра',
    subtitle: 'Технопарк/Минцифры: метрики и партнёры',
    icon: <Shield className="h-4 w-4 text-[#9FB0D0]" />,
    visibleFor: ['admin'],
  },
]

export default function More() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  return (
    <Page>
      <PageHeader title="Ещё" subtitle="Дополнительные разделы. Основное — в «Задачах»." />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items
          .filter((i) => {
            if (!i.visibleFor) return true
            if (!role) return false
            return i.visibleFor.includes(role)
          })
          .map((i) => (
            <Link key={i.to} to={i.to} className="group">
              <Card className="transition group-hover:ring-[#6C8CFF]/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {i.icon}
                    <div className="text-sm font-medium">{i.title}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-[#9FB0D0]">{i.subtitle}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>
    </Page>
  )
}

