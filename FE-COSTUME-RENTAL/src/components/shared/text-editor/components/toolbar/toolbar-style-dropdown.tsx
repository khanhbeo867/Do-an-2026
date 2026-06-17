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
import { type Level as HeadingLevel } from '@tiptap/extension-heading'
import { useEditorState } from '@tiptap/react'
import React, { useMemo } from 'react'
import { useEditorContext } from '../../context/editor-context'

type Level = 0 | HeadingLevel
type BlockTypeItem = { icon: IconProps['name']; label: string; value: Level }

export const StyleDropdownMenu: React.FC = () => {
  const { editor } = useEditorContext()

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isHeading1: editor.isActive('heading', { level: 1 }),
      isHeading2: editor.isActive('heading', { level: 2 }),
      isHeading3: editor.isActive('heading', { level: 3 }),
    }),
  })

  const getCurrentStyle = ((): BlockTypeItem => {
    switch (true) {
      case editorState.isHeading1:
        return {
          label: 'Tiêu đề 1',
          value: 1,
          icon: 'Heading1',
        }
      case editorState.isHeading2:
        return {
          label: 'Tiêu đề 2',
          value: 2,
          icon: 'Heading2',
        }
      case editorState.isHeading3:
        return {
          label: 'Tiêu đề 3',
          value: 3,
          icon: 'Heading3',
        }
      default:
        return {
          label: 'Văn bản thường',
          value: 0,
          icon: 'Type',
        }
    }
  })()

  const presetStyles: Array<BlockTypeItem> = useMemo(
    () => [
      { label: 'Văn bản thường', value: 0, icon: 'Type' },
      {
        label: 'Tiêu đề 1',
        value: 1,
        icon: 'Heading1',
      },
      {
        label: 'Tiêu đề 2',
        value: 2,
        icon: 'Heading2',
      },
      {
        label: 'Tiêu đề 3',
        value: 3,
        icon: 'Heading3',
      },
    ],
    []
  )

  return (
    <DropdownMenu>
      <Tooltip
        message="Thay đổi kiểu định dạng"
        triggerProps={{
          render: (
            <DropdownMenuTrigger
              render={
                <Button type="button" variant="secondary" size="sm" className="h-8 min-w-32 gap-x-2">
                  <Icon name={getCurrentStyle.icon} /> {getCurrentStyle.label}
                </Button>
              }
            />
          ),
        }}
      ></Tooltip>
      <DropdownMenuContent className="w-fit" align="center">
        <DropdownMenuRadioGroup
          value={getCurrentStyle.value.toString()}
          onValueChange={(value) => {
            if (value === '0') {
              editor.commands.setParagraph()
              return
            }
            editor
              .chain()
              .focus()
              .setHeading({ level: +value as HeadingLevel })
              .run()
          }}
        >
          {presetStyles.map((style) => (
            <DropdownMenuRadioItem key={style.value} value={String(style.value)} className="gap-x-2">
              <Icon name={style.icon} /> {style.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
