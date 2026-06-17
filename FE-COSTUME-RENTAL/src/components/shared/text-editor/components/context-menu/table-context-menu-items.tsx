import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu'
import { Icon } from '@/components/ui/icon'
import type { Editor } from '@tiptap/react'
import React, { Fragment, useMemo } from 'react'

const TableContextMenuItems: React.FC<{ editor: Editor }> = ({ editor }) => {
  const canSplitMergedCell = useMemo(() => {
    const cellAttributes = editor.getAttributes('tableCell')
    const cellHeadAttributes = editor.getAttributes('tableHeader')
    return (
      cellAttributes?.colspan > 1 ||
      cellAttributes?.rowspan > 1 ||
      cellHeadAttributes?.colspan > 1 ||
      cellHeadAttributes?.rowspan > 1
    )
  }, [editor])

  const canMergeCell = useMemo(() => editor.view.state.selection.ranges.length > 1, [editor])

  return (
    <Fragment>
      <ContextMenuSeparator />
      <ContextMenuItem className="gap-x-2" onClick={() => editor.commands.addRowBefore()}>
        <Icon name="Plus" />
        Chèn hàng bên trên
      </ContextMenuItem>
      <ContextMenuItem className="gap-x-2" onClick={() => editor.commands.addRowAfter()}>
        <Icon name="Plus" />
        Chèn hàng bên dưới
      </ContextMenuItem>
      <ContextMenuItem className="gap-x-2" onClick={() => editor.commands.addColumnBefore()}>
        <Icon name="Plus" />
        Chèn cột bên trái
      </ContextMenuItem>
      <ContextMenuItem className="gap-x-2" onClick={() => editor.commands.addColumnAfter()}>
        <Icon name="Plus" />
        Chèn cột bên phải
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem className="gap-x-2" onClick={() => editor.commands.deleteRow()}>
        <Icon name="Trash2" />
        Xóa hàng
      </ContextMenuItem>
      <ContextMenuItem className="gap-x-2" onClick={() => editor.commands.deleteColumn()}>
        <Icon name="Trash2" />
        Xóa cột
      </ContextMenuItem>
      <ContextMenuItem className="gap-x-2" onClick={() => editor.commands.deleteTable()}>
        <Icon name="Trash2" />
        Xóa bảng
      </ContextMenuItem>
      {(canMergeCell || canSplitMergedCell) && <ContextMenuSeparator />}
      {editor.view.state.selection.ranges.length > 1 && (
        <ContextMenuItem className="gap-x-2" onClick={() => editor.commands.mergeCells()}>
          <Icon name="FoldHorizontal" />
          Hợp nhất ô
        </ContextMenuItem>
      )}
      {canSplitMergedCell && (
        <ContextMenuItem className="gap-x-2" onClick={() => editor.commands.splitCell()}>
          <Icon name="UnfoldHorizontal" />
          Hủy hợp nhất ô
        </ContextMenuItem>
      )}
    </Fragment>
  )
}

export default TableContextMenuItems
