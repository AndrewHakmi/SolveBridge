import { Outlet } from 'react-router-dom'

import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export function AppShell() {
  return (
    <div className="min-h-full">
      <Header />
      <div className="mx-auto flex w-full max-w-[1600px] gap-3 px-6 pb-[200px] pt-4">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

