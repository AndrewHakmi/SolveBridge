import { cn } from '@/lib/utils'
import { type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg bg-[#0F1830] px-3 text-sm text-[#EAF0FF] ring-1 ring-[#1E2A44] transition',
        'placeholder:text-[#9FB0D0]/70 focus:outline-none focus:ring-2 focus:ring-[#6C8CFF]',
        className,
      )}
      {...props}
    />
  )
}

