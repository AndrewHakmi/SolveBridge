import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

export function Button({ className, variant = 'secondary', ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
        'focus:outline-none focus:ring-2 focus:ring-[#6C8CFF] focus:ring-offset-0',
        'disabled:opacity-50 disabled:pointer-events-none',
        variant === 'primary' &&
          'bg-[#6C8CFF] text-[#0B1220] hover:brightness-110',
        variant === 'secondary' &&
          'bg-[#111A2E] text-[#EAF0FF] ring-1 ring-[#1E2A44] hover:bg-[#132042]',
        variant === 'ghost' &&
          'bg-transparent text-[#EAF0FF] hover:bg-[#111A2E] ring-1 ring-transparent hover:ring-[#1E2A44]',
        variant === 'danger' &&
          'bg-[#FF5A6A] text-[#0B1220] hover:brightness-110',
        className,
      )}
      {...props}
    />
  )
}

