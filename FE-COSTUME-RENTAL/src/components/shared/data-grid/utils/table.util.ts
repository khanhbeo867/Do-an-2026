import type { Column, Table } from '@tanstack/react-table'
import type { CSSProperties } from 'react'

export function columnSizingHandler(node: HTMLTableCellElement | null, table: Table<any>, column: Column<any>) {
  if (!node) return
  // ! If you don't do that, there will be an infinite loop. We update the value in state only if the value has actually changed.
  if (table.getState().columnSizing[column.id] === node.getBoundingClientRect().width) return
  if (column.columns.length > 0)
    table.setColumnSizing((prevSizes) => ({
      ...prevSizes,
      // * 100% accurate float-point width, even if table content is loaded async
      [column.id]: node.getBoundingClientRect().width,
    }))
}

export function getStickyOffsetPosition<TData = any, TValue = any>(column: Column<TData, TValue>): CSSProperties {
  const stickyAlignment = column.getIsPinned()

  switch (stickyAlignment) {
    case 'left': {
      return {
        position: 'sticky',
        zIndex: 10,
        left: column.getStart('left'),
        boxShadow: '1px 0px hsl(var(--border))',
      }
    }
    case 'right': {
      return {
        position: 'sticky',
        zIndex: 10,
        right: column.getAfter('right'),
        boxShadow: '-1px 0px hsl(var(--border))',
        borderLeft: 'none',
      }
    }
    default: {
      return {
        position: 'relative',
        zIndex: 0,
        borderLeft: column.getIsFirstColumn() ? 'none' : undefined,
      }
    }
  }
}
