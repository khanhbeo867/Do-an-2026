import { cn } from '@/lib/utils'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Tooltip } from '@/components/shared/tooltip'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon, type IconProps } from '@/components/ui/icon'
import { useEditorContext } from '../../context/editor-context'

type AlignmentOption = {
  icon: IconProps['name']
  value: 'left' | 'right' | 'center' | 'justify'
  label: string
}

export const AlignmentDropdownMenu: React.FC = () => {
  const { editor } = useEditorContext()

  const presetAlignments: Array<AlignmentOption> = useMemo(
    () => [
      {
        icon: 'TextAlignStart',
        value: 'left',
        label: 'Căn trái',
      },
      {
        icon: 'TextAlignEnd',
        value: 'right',
        label: 'Căn phải',
      },
      {
        icon: 'TextAlignCenter',
        value: 'center',
        label: 'Canh giữa',
      },
      {
        icon: 'TextAlignJustify',
        value: 'justify',
        label: 'Căn đều',
      },
    ],
    []
  )
  const getCurrentAlignment = useCallback((): Omit<AlignmentOption, 'label'> => {
    switch (true) {
      case editor.isActive({ textAlign: 'left' }):
        return {
          icon: 'TextAlignStart',
          value: 'left',
        }
      case editor.isActive({ textAlign: 'right' }):
        return {
          icon: 'TextAlignEnd',
          value: 'right',
        }
      case editor.isActive({ textAlign: 'center' }):
        return {
          icon: 'TextAlignCenter',
          value: 'center',
        }
      case editor.isActive({ textAlign: 'justify' }):
        return {
          icon: 'TextAlignJustify',
          value: 'justify',
        }

      default:
        return {
          icon: 'TextAlignStart',
          value: 'left',
        }
    }
  }, [editor])

  const [alignmentState, setAlignmentState] = useState<Omit<AlignmentOption, 'label'>>(getCurrentAlignment())

  useEffect(() => {
    const updateAlignment = () => {
      setAlignmentState(getCurrentAlignment())
    }

    editor.on('update', updateAlignment)
    editor.on('selectionUpdate', updateAlignment)
    editor.on('focus', updateAlignment)

    return () => {
      editor.off('update', updateAlignment)
      editor.off('selectionUpdate', updateAlignment)
      editor.off('focus', updateAlignment)
    }
  }, [editor, getCurrentAlignment])

  return (
    <DropdownMenu>
      <Tooltip
        message="Canh lề"
        triggerProps={{
          render: (
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="aspect-square h-8 w-8" type="button">
                  <Icon name={alignmentState?.icon} />
                </Button>
              }
            />
          ),
        }}
      />
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          className="flex list-none flex-row! gap-x-2"
          value={alignmentState?.value}
          onValueChange={(value) => {
            editor.commands.setTextAlign(value)
            setAlignmentState(getCurrentAlignment())
          }}
        >
          {presetAlignments.map((option) => (
            <Tooltip message={option.label} key={option.value}>
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className={cn('p-2 hover:bg-accent hover:text-accent-foreground [&>span]:hidden', {
                  'bg-secondary': alignmentState?.value === option.value,
                })}
              >
                <Icon name={option.icon} size={16} />
              </DropdownMenuRadioItem>
            </Tooltip>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
