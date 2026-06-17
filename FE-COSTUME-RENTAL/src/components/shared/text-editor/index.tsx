import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@/components/ui/context-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, isServer } from '@/lib/utils'
import { EditorContent, useEditor } from '@tiptap/react'
import { useDeepCompareEffect } from 'ahooks'
import { uniqueId } from 'lodash-es'
import React, { useImperativeHandle, useState, type RefCallback } from 'react'
import isEqual from 'react-fast-compare'
import BubbleMenu from './components/bubble-menu'
import CommonContextMenuItems from './components/context-menu/common-context-menu-items'
import LinkContextMenuItems from './components/context-menu/link-context-menu-items'
import TableContextMenuItems from './components/context-menu/table-context-menu-items'
import Toolbar from './components/toolbar'
import { EditorContextProvider } from './context/editor-context'
import { editorExtensions } from './extensions'

export interface EditorProps {
  onUpdate?: (state: { value: string; isEmpty: boolean }) => unknown
  id?: string
  ref?: React.RefObject<typeof EditorContent.prototype> | RefCallback<any>
  name?: string
  defaultValue?: string
  disabled?: boolean
  height?: number
}

/**
 * @author quanghiep03198
 * @description A rich text editor component using Tiptap with a customizable toolbar, context menus, and support for various content types.
 *
 * Props:
 * - `onUpdate`: Callback function triggered on content update, providing the current HTML value and empty state.
 * - `id`: Optional ID for the editor element.
 * - `ref`: Optional ref for accessing the editor instance.
 * - `name`: Optional name attribute for the editor element.
 * - `defaultValue`: Initial HTML content for the editor.
 * - `disabled`: Boolean to disable editing.
 * - `height`: Height of the editor area in pixels (default is 350).
 * Returns:
 * - A React functional component rendering a rich text editor with toolbar and context menus.
 */

export const Editor: React.FC<EditorProps> = ({
  defaultValue = '',
  id = uniqueId(),
  ref,
  disabled,
  name,
  height = 350,
}) => {
  const [contextMenuType, setContextMenuType] = useState<keyof HTMLElementTagNameMap | null>(null)

  const editor = useEditor(
    {
      content: defaultValue,
      extensions: editorExtensions,
      editorProps: {
        attributes: {
          class: cn(
            'p-4 rounded-lg max-w-full max-h-full overflow-auto scrollbar-none border-none outline-none focus:outline-none focus:border-none min-h-[50vh] text-foreground bg-transparent',
            'prose prose-li:p-0 prose-p:text-sm prose-strong:text-inherit'
          ),
        },
      },
      enableCoreExtensions: true,
      editable: !disabled,
      immediatelyRender: !isServer,
    },
    [disabled]
  )

  useDeepCompareEffect(() => {
    if (!editor || !defaultValue) return
    if (isEqual(editor.getHTML(), defaultValue)) return // guard tránh loop
    editor.commands.setContent(defaultValue)
  }, [defaultValue]) // editor không cần trong dep vì stable ref

  const handleContextMenuOpen: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    const target = e.target as typeof e.currentTarget
    switch (true) {
      case Boolean(target.closest('table')):
        setContextMenuType('table')
        break
      case Boolean(target.closest('a')):
        setContextMenuType('a')
        break
      case Boolean(target.closest('img')):
        setContextMenuType('img')
        break
      default:
        setContextMenuType(null)
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      getHTML: () => editor?.getHTML() ?? '',
      isEmpty: () => editor?.isEmpty ?? true,
    }),
    [editor]
  )

  return (
    <div
      className={cn(
        'relative flex w-full max-w-full flex-col items-stretch divide-y bg-transparent divide-border overflow-clip rounded-lg border shadow-xs',
        disabled && 'cursor-not-allowed opacity-50 [&>nav]:pointer-events-none'
      )}
    >
      <EditorContextProvider editor={editor}>
        <Toolbar />
        <ContextMenu>
          <ContextMenuTrigger onContextMenu={handleContextMenuOpen}>
            <ScrollArea className="relative w-full max-w-full resize-y overflow-auto " style={{ height }}>
              <EditorContent
                id={id}
                editor={editor}
                name={name}
                controls={true}
                content={defaultValue}
                disabled={disabled}
                className={cn(
                  '[&_*.tableWrapper>table]:w-full',
                  'p-4 rounded-lg max-w-full max-h-full scrollbar-none border-none outline-none focus:outline-none focus:border-none min-h-[50vh] text-foreground',
                  'prose prose-li:p-0 pr prose-p:text-sm prose-strong:text-inherit'
                )}
              />
            </ScrollArea>
          </ContextMenuTrigger>
          <ContextMenuContent className="min-w-[320px]">
            <CommonContextMenuItems editor={editor} />
            {contextMenuType === 'table' && <TableContextMenuItems editor={editor} />}
            {contextMenuType === 'a' && <LinkContextMenuItems editor={editor} />}
          </ContextMenuContent>
        </ContextMenu>
      </EditorContextProvider>
      <BubbleMenu editor={editor} />
    </div>
  )
}

Editor.displayName = 'Editor'
