import { cn } from '@/lib/utils'
import { Separator } from '../../ui/separator'
import { type TypographyProps } from '../../ui/typography'

type PageTitleProps = React.PropsWithChildren &
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export const PageHeader: React.FC<PageTitleProps> = ({ children, className, ref }) => (
  <div
    ref={ref}
    className={cn(
      'grid auto-cols-auto grid-flow-col items-start gap-x-6 gap-y-1 text-left sm:items-center sm:text-center',
      className
    )}
  >
    {children}
  </div>
)

export const PageTitle: React.FC<TypographyProps> = ({ children, className }) => (
  <div className={cn('col-start-1 text-left text-xl/relaxed font-semibold tracking-tight', className)}>{children}</div>
)

export const PageDescription: React.FC<TypographyProps> = ({ children, className }) => (
  <div className={cn('text-muted-foreground col-start-1 row-start-2 text-left text-sm/relaxed text-pretty', className)}>
    {children}
  </div>
)

export const PageAction: React.FC<React.ComponentProps<'div'>> = ({ children, className, ...props }) => {
  return (
    <div
      {...props}
      className={cn('col-start-2 row-span-2 row-start-1 flex items-stretch justify-end gap-2', className)}
    >
      {children}
    </div>
  )
}

export const PageWrapper: React.FC<React.ComponentProps<'section'>> = ({ children, className, ...props }) => {
  return (
    <section {...props} className={cn('space-y-4', className)}>
      {children}
    </section>
  )
}

export const PageSeparator: React.FC<React.ComponentProps<typeof Separator>> = ({ className, ...props }) => (
  <Separator {...props} className={className} />
)
