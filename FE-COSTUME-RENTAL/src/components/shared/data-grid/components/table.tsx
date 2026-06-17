import tw from '@/lib/tw'
import { cn } from '@/lib/utils'
import { useUpdateEffect } from 'ahooks'
import React, { useId, useMemo, useRef } from 'react'

import { Table, TableCaption } from '@/components/ui/table'
import { ROW_ACTIONS_COLUMN_ID } from '../constants'
import { useTableContext } from '../context/table.context'
import { type DataTableProps, type TableFooterProps } from '../types'
import DataTableBody from './table-body'
import DataTableBodyLoading from './table-body-loading'
import DataTableEmpty from './table-empty'
import TableFooter from './table-footer'
import { TableHeadCaption } from './table-head-caption'
import { DataTableHeader } from './table-header'

type TableProps = Omit<DataTableProps, 'data' | 'slot'> &
  Omit<React.AllHTMLAttributes<HTMLTableElement>, 'data'> &
  Pick<React.ComponentProps<'div'>, 'style'>

const DataTable: React.FC<TableProps> = (props) => {
  const { table } = useTableContext('table')
  const containerRef = useRef<HTMLDivElement>(null)
  const captionId = useId()

  const {
    containerProps = { className: cn('h-87.5 xxl:h-125') },
    footerProps = { hidden: true, slot: null },
    caption,
    loading,
    virtualizerOptions = {
      estimateSize: 36,
      overscan: 5,
      enabled: true,
    },
    renderSubComponent,
    getRowClassName,
  } = props

  const computedColumnSizes = useMemo(() => {
    const headers = table.getFlatHeaders()
    const columnSizes: Record<string, string> = {}
    headers.forEach((header) => {
      columnSizes[`--header-${header.id}-size`] = header.getSize() + 'px'
      columnSizes[`--column-${header.column.id}-size`] = header.column.getSize() + 'px'
    })
    return columnSizes
  }, [table.getState().columnSizingInfo, table.getState().columnSizing])

  const tableStyles = useMemo(
    () =>
      ({
        '--header-row-height': '36px',
        '--row-height': `${virtualizerOptions.estimateSize ?? 36}px`,
      }) as React.CSSProperties,
    [virtualizerOptions.estimateSize]
  )

  useUpdateEffect(() => {
    table.setColumnPinning((prev) => {
      if (prev.right!.includes(ROW_ACTIONS_COLUMN_ID)) {
        prev.right = prev.right!.filter((id) => id !== ROW_ACTIONS_COLUMN_ID).concat(ROW_ACTIONS_COLUMN_ID)
      }
      return prev
    })
  }, [table.getState().columnPinning])

  return (
    <Wrapper data-slot="wrapper" style={{ ...computedColumnSizes, ...tableStyles }}>
      {caption && <TableHeadCaption id={captionId} aria-description={caption} />}
      <ScrollArea
        ref={containerRef}
        data-slot="scroll-area"
        style={{
          scrollbarGutter: 'stable',
          overflowAnchor: 'none',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
        }}
        {...containerProps}
      >
        <Table data-role="data-grid" className="table-auto border-separate border-spacing-0 border-none">
          {caption && (
            <TableCaption aria-labelledby={captionId} className="hidden">
              {caption}
            </TableCaption>
          )}
          <DataTableHeader />
          {loading ? (
            <DataTableBodyLoading />
          ) : table.getRowModel().rows.length === 0 ? (
            <DataTableEmpty />
          ) : (
            <DataTableBody
              table={table}
              containerRef={containerRef as React.RefObject<HTMLDivElement>}
              shouldEnableVirtualizer={virtualizerOptions.enabled!}
              estimatedRowHeight={virtualizerOptions.estimateSize!}
              renderSubComponent={renderSubComponent}
              getRowClassName={getRowClassName}
            />
          )}
        </Table>
      </ScrollArea>
      {footerProps && <TableFooter {...(footerProps as TableFooterProps)} />}
    </Wrapper>
  )
}

const Wrapper = tw.div`bg-background flex flex-col items-stretch border outline-none ring-0 ring-offset-0 ring-offset-transparent overflow-clip rounded-md`
const ScrollArea = tw.div`@container-[size] relative flex flex-col items-stretch overflow-scroll will-change-scroll scrollbar-track-scrollbar/20 outline-none border-none ring-0 ring-offset-0 ring-offset-transparent backface-hidden`

DataTable.displayName = 'DataTable'

export default DataTable
