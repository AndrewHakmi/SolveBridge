import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'accent' | 'success' | 'danger'
}

export function Badge({ className, tone = 'neutral', ...props }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
        tone === 'neutral' && 'bg-[#0F1830] text-[#9FB0D0] ring-[#1E2A44]',
        tone === 'accent' && 'bg-[#6C8CFF]/15 text-[#6C8CFF] ring-[#6C8CFF]/30',
        tone === 'success' && 'bg-[#3DDC97]/15 text-[#3DDC97] ring-[#3DDC97]/30',
        tone === 'danger' && 'bg-[#FF5A6A]/15 text-[#FF5A6A] ring-[#FF5A6A]/30',
        className,
      )}
      {...props}
    />
  )
}

