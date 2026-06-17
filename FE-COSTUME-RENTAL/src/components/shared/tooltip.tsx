import { cn } from '@/lib/utils'
import React from 'react'
import { TooltipContent, TooltipProvider, TooltipTrigger, Tooltip as TooltipWrapper } from '../ui/tooltip'

export type TooltipProps = {
  message: string
  triggerProps?: Partial<React.ComponentProps<typeof TooltipTrigger>>
  providerProps?: Partial<React.ComponentProps<typeof TooltipProvider>>
  contentProps?: Partial<React.ComponentProps<typeof TooltipContent>>
} & React.PropsWithChildren

export const Tooltip = ({
  children,
  message,
  triggerProps = { type: 'button' },
  providerProps,
  contentProps = { side: 'top' },
}: TooltipProps) => {
  return (
    <TooltipProvider {...providerProps}>
      <TooltipWrapper>
        <TooltipTrigger {...triggerProps}>{children}</TooltipTrigger>
        <TooltipContent
          {...contentProps}
          className={cn(
            'aria-invalid:bg-destructive aria-invalid:text-destructive-foreground z-50 whitespace-nowrap',
            contentProps.className
          )}
        >
          {message}
        </TooltipContent>
      </TooltipWrapper>
    </TooltipProvider>
  )
}
