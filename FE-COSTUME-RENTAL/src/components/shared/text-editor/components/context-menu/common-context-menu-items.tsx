import { ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut } from '@/components/ui/context-menu'
import { Icon } from '@/components/ui/icon'
import type { Editor } from '@tiptap/react'
import { Fragment, useEffect, useState } from 'react'

const getCopiedData = async () => {
  try {
    const clipboardItems = await navigator.clipboard.read()
    const type = clipboardItems[0].types.includes('text/html') ? 'text/html' : 'text/plain'
    return await (await clipboardItems[0].getType(type)).text()
  } catch {
    return null
  }
}

const CommonContextMenuItems: React.FC<{ editor: Editor }> = ({ editor }) => {
  const [canPaste, setCanPaste] = useState<boolean>(false)

  useEffect(() => {
    getCopiedData().then((data) => {
      setCanPaste(Boolean(data))
    })
  }, [navigator.clipboard])

  return (
    <Fragment>
      <ContextMenuItem
        disabled={editor.view.state.selection.empty}
        className="gap-x-2"
        onClick={() => document.execCommand('copy')}
      >
        <Icon name="Copy" /> Copy
        <ContextMenuShortcut>⌘+c</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem
        disabled={editor.view.state.selection.empty}
        className="gap-x-2"
        onClick={() => document.execCommand('cut')}
      >
        <Icon name="Scissors" /> Cut
        <ContextMenuShortcut>⌘+x</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        className="gap-x-2"
        disabled={!canPaste}
        onClick={async () => {
          try {
            const coppiedData = await getCopiedData()
            editor.commands.insertContentAt(editor.state.selection.anchor, coppiedData)
          } catch (err) {
            console.error('Failed to read clipboard contents: ', err)
          }
        }}
      >
        <Icon name="ClipboardPaste" />
        Dán
        <ContextMenuShortcut>⌘+v</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem
        disabled={!canPaste}
        className="flex gap-x-2 whitespace-nowrap"
        onClick={async () => {
          const copiedData = await navigator.clipboard.readText()
          editor.commands.insertContentAt(editor.state.selection.anchor, copiedData)
        }}
      >
        <Icon name="ClipboardX" />
        Dán và không áp dụng định dạng
        <ContextMenuShortcut>⌘+⇧+v</ContextMenuShortcut>
      </ContextMenuItem>
    </Fragment>
  )
}

export default CommonContextMenuItems
