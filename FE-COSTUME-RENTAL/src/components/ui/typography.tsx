import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { useRef } from 'react'

export type TypographyProps = {
  as?: React.ElementType
  ref?: React.RefObject<HTMLElement>
} & React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof typographyVariants> &
  React.PropsWithChildren

export const typographyVariants = cva('font-sans', {
  variants: {
    variant: {
      default: 'text-base tracking-tight text-inherit',
      h1: 'text-4xl md:text-3xl sm:text-3xl scroll-m-20 font-bold tracking-tight leading-tight',
      h2: 'text-3xl md:text-2xl sm:text-xl font-semibold scroll-m-20 tracking-tight leading-tight',
      h3: 'text-2xl md:text-xl sm:text-lg font-semibold tracking-tight scroll-m-20 leading-tight',
      h4: 'text-xl md:text-lg sm:text-base font-semibold tracking-tight scroll-m-20',
      p: 'leading-7',
      code: 'leading-7 font-mono',
      blockquote: 'mt-6 border-l-2 pl-6 italic',
      small: 'text-sm leading-snug',
    },
    color: {
      default: 'text-[inherit]',
      primary: 'text-primary',
      accent: 'text-accent',
      active: 'text-active',
      warning: 'text-warning',
      secondary: 'text-secondary',
      muted: 'text-muted-foreground',
      success: 'text-success',
      destructive: 'text-destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
    color: 'default',
  },
})

export const Typography: React.FC<TypographyProps> = ({ ref, ...props }) => {
  const { as, className, children, color, variant = 'default', ...restProps } = props

  const localRef = useRef(null)
  const resolvedRef = ref ?? localRef

  const Element: React.ElementType = as || (variant === 'default' ? 'p' : variant)!

  return (
    <Element ref={resolvedRef} className={cn(typographyVariants({ variant, color, className }))} {...restProps}>
      {children}
    </Element>
  )
}

Typography.displayName = 'Typography'
