import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import React from 'react'

import { Icon } from '@/components/ui/icon'

import { Tooltip } from '@/components/shared/tooltip'
import { useEditorContext } from '../../context/editor-context'

const ImagePlaceholderToolbar: React.FC<React.ComponentProps<typeof Button>> = ({
  className,
  onClick,
  children,
  ...props
}) => {
  const { editor } = useEditorContext()

  return (
    <Tooltip
      message="hình ảnh"
      triggerProps={{
        render: (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={cn('aspect-square size-8 p-0', editor?.isActive('image-placeholder') && 'bg-accent', className)}
            onClick={(e) => {
              e.preventDefault()
              editor?.chain().focus().insertImagePlaceholder().run()
              onClick?.(e)
            }}
            {...props}
          >
            {children ?? <Icon name="Image" className="h-4 w-4" />}
          </Button>
        ),
      }}
    />
  )
}

ImagePlaceholderToolbar.displayName = 'ImagePlaceholderToolbar'

export { ImagePlaceholderToolbar }
