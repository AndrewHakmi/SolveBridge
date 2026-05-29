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
    <div className="relative md:-ml-[276px] md:w-[calc(100%+276px)]">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mx-auto mt-1 max-w-[72ch] text-sm text-[#9FB0D0]">{subtitle}</p>
        ) : null}
      </div>
      {right ? (
        <div className="absolute right-0 top-0 flex items-center gap-2">{right}</div>
      ) : null}
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
      <div className="col-span-12 lg:col-span-9">{main}</div>
      {aside ? <div className="col-span-12 lg:col-span-3">{aside}</div> : null}
    </div>
  )
}

