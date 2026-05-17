import { forwardRef, type TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'min-h-[120px] w-full rounded-xl bg-[#0F1830] px-3 py-2 text-sm text-[#EAF0FF] ring-1 ring-[#1E2A44] outline-none transition',
          'placeholder:text-[#6B7BA3] focus:ring-2 focus:ring-[#6C8CFF]/40',
          className,
        )}
        {...props}
      />
    )
  },
)
