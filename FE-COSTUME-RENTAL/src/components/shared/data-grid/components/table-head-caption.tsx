import React, { memo } from 'react'

export const TableHeadCaption: React.FC<React.ComponentProps<'div'> & React.PropsWithChildren> = memo(
  ({ children, ...props }) => {
    return (
      <div
        {...props}
        className="bg-background text-muted-foreground sticky top-0 z-20 flex h-10 translate-y-[0.5px] items-center rounded-t-[inherit] border-b px-4 text-center text-sm font-medium"
      >
        {props['aria-description'] ?? children}
      </div>
    )
  },
  (prev, next) => prev['aria-description'] === next['aria-description']
)

TableHeadCaption.displayName = 'TableHeadCaption'
