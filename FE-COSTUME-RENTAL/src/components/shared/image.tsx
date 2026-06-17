import { cn } from '@/lib/utils'
import React, { useRef, useState } from 'react'
import { Icon } from '../ui/icon'

interface ImageProps extends React.ComponentProps<'img'> {
  fallbackSize?: number // width & height in px
}

const FallbackIcon: React.FC<React.ComponentProps<'div'>> = ({ className, title, ...props }) => (
  <div
    role="img"
    aria-label="Image not available"
    title={title}
    className={cn('bg-muted/80 text-muted-foreground place-content-center place-items-center', className)}
    {...props}
  >
    <Icon name="Image" size={24} className="size-6" strokeWidth={1.5} />
  </div>
)

const Image: React.FC<ImageProps> = ({ ref, src, alt = '', className, loading = 'lazy', ...props }) => {
  const localRef = useRef<HTMLImageElement>(null)
  const resolvedRef = ref || localRef
  const [isError, setIsError] = useState(false)

  if (!src || isError) {
    return <FallbackIcon {...{ className, title: alt, ...props }} />
  }

  return (
    <img
      ref={resolvedRef}
      src={src}
      alt={alt}
      loading={loading}
      className={cn('object-cover', className)}
      onLoadedData={() => setIsError(false)}
      onError={() => setIsError(true)}
      {...props}
    />
  )
}

export default Image
