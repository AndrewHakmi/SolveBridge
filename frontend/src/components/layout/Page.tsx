import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function Page({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-1 max-w-[72ch] text-sm text-[#9FB0D0]">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  )
}

export function TwoCol({
  main,
  aside,
  className,
}: {
  main: ReactNode
  aside?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-12 gap-4', className)}>
      <div className="col-span-12 lg:col-span-8">{main}</div>
      {aside ? <div className="col-span-12 lg:col-span-4">{aside}</div> : null}
    </div>
  )
}

