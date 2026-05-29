import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: Props) {
  return (
    <div
      className={cn(
        'rounded-xl bg-[#111A2E] ring-1 ring-[#1E2A44] shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: Props) {
  return (
    <div className={cn('px-4 pt-4 pb-3', className)} {...props} />
  )
}

export function CardContent({ className, ...props }: Props) {
  return (
    <div className={cn('px-4 pb-4', className)} {...props} />
  )
}

