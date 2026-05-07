import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
  tone?: 'info' | 'success' | 'warning' | 'danger'
}

export function Alert({ className, tone = 'info', ...props }: Props) {
  return (
    <div
      className={cn(
        'rounded-xl px-3 py-2 text-sm ring-1',
        tone === 'info' && 'bg-[#0F1830] text-[#9FB0D0] ring-[#1E2A44]',
        tone === 'success' &&
          'bg-[#3DDC97]/10 text-[#3DDC97] ring-[#3DDC97]/25',
        tone === 'warning' &&
          'bg-[#FFD166]/10 text-[#FFD166] ring-[#FFD166]/25',
        tone === 'danger' && 'bg-[#FF5A6A]/10 text-[#FF5A6A] ring-[#FF5A6A]/25',
        className,
      )}
      {...props}
    />
  )
}

