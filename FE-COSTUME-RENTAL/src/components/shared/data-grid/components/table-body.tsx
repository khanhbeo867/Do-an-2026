import { TableBody } from '@/components/ui/table'
import useScrollToFn from '@/hooks/use-scroll-fn'
import useVirtualScrollPadding from '@/hooks/use-virtual-scroll-padding'
import { type Table, type Row as TRow } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Activity, memo, useCallback, useMemo } from 'react'
import { useTableContext } from '../context/table.context'
import { type RenderSubComponent } from '../types'
import { MemoizedVirtualTableRow, VirtualPlaceholderRow } from './table-row'

export type TableBodyProps = {
  table: Table<any>
  containerRef: React.RefObject<HTMLDivElement>
  estimatedRowHeight: number
  shouldEnableVirtualizer: boolean
  renderSubComponent?: RenderSubComponent<any>
  getRowClassName?: (row: any) => string
}

export const DataTableBody: React.FC<TableBodyProps> = ({
  containerRef,
  shouldEnableVirtualizer,
  estimatedRowHeight,
  renderSubComponent,
  getRowClassName,
}) => {
  const { table } = useTableContext('table')
  const { rows } = table.options.manualFiltering ? table.getRowModel() : table.getFilteredRowModel()
  const overscan = useMemo(() => (table.getIsSomeRowsExpanded() ? 20 : 10), [table.getState().expanded])
  const scrollToFn = useScrollToFn(containerRef)
  const estimateSize = useCallback(() => estimatedRowHeight, [estimatedRowHeight])
  const getScrollElement = () => containerRef.current
  const getItemKey = useCallback((index: number) => table.getRowModel().rows[index]?.id, [table.options.data])

  const virtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    overscan,
    horizontal: false,
    getItemKey,
    getScrollElement,
    estimateSize,
    scrollToFn,
    enabled: shouldEnableVirtualizer,
    measureElement: undefined, // Disable auto measurement
    initialRect: containerRef?.current?.getBoundingClientRect?.(),
    debug: false,
  })

  const { before, after } = useVirtualScrollPadding<HTMLDivElement, HTMLTableRowElement>(virtualizer)

  const virtualItems = virtualizer.getVirtualItems()
  const colSpan = table.getAllColumns().length

  if (!shouldEnableVirtualizer)
    return (
      <TableBody>
        {rows.map((row) => (
          <MemoizedVirtualTableRow
            key={row.id}
            row={row}
            index={row.index}
            renderSubComponent={renderSubComponent}
            getRowClassName={getRowClassName}
          />
        ))}
      </TableBody>
    )

  return (
    <TableBody style={{ height: virtualizer.getTotalSize() }}>
      <Activity mode={before > 0 ? 'visible' : 'hidden'}>
        <VirtualPlaceholderRow colSpan={colSpan} style={{ height: before }} />
      </Activity>
      {Array.isArray(virtualItems) &&
        virtualItems.map((virtualItem) => {
          const row = rows[virtualItem.index] as TRow<any>
          return (
            <MemoizedVirtualTableRow
              key={row.id}
              row={row}
              index={virtualItem.index}
              isScrolling={virtualizer.isScrolling}
              renderSubComponent={renderSubComponent}
              getRowClassName={getRowClassName}
            />
          )
        })}
      <Activity mode={after > 0 ? 'visible' : 'hidden'}>
        <VirtualPlaceholderRow colSpan={colSpan} style={{ height: after }} />
      </Activity>
    </TableBody>
  )
}

export default memo(
  DataTableBody,
  (_prevProps, nextProps) => nextProps.table.getState()?.columnSizingInfo?.isResizingColumn !== false
) as typeof DataTableBody
