import { TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { type HeaderGroup, type RowData } from '@tanstack/react-table'
import { useMemoizedFn, useUpdate } from 'ahooks'
import { Fragment, memo } from 'react'
import { useTableContext } from '../context/table.context'
import { columnSizingHandler, getStickyOffsetPosition } from '../utils'
import ColumnResizer from './column-resizer'
import TableCellHead from './table-cell-head'
import { TableColumnFilter } from './table-column-filter'

const DataTableHeader: React.FC = () => {
  const rerender = useUpdate()

  const { table, event$ } = useTableContext('table', 'event$')

  event$.useSubscription((value) => {
    if (value.columnPinning) {
      rerender()
    }
  })

  return (
    <TableHeader className="bg-background sticky top-0 z-20">
      {table.getHeaderGroups().map((headerGroup) => {
        return (
          <Fragment key={headerGroup.id}>
            <TableHeaderRow headerGroup={headerGroup} />
            <TableHeaderFilterRow headerGroup={headerGroup} />
          </Fragment>
        )
      })}
    </TableHeader>
  )
}

DataTableHeader.displayName = 'DataTableHeader'

const TableHeaderRow: React.FC<{ headerGroup: HeaderGroup<RowData> }> = ({ headerGroup }) => {
  //

  const { table } = useTableContext('table')
  const computeStickyOffsetPosition = useMemoizedFn(getStickyOffsetPosition)

  return (
    <TableRow data-role="data-grid-row" className="h-(--header-row-height,40px) divide-x [&_th]:border-x-0">
      {headerGroup.headers.map((header) => {
        const rowSpan = header.column.columnDef.meta?.rowSpan
        if (!header.isPlaceholder && rowSpan !== undefined && header.id === header.column.id) {
          return null
        }

        return (
          <TableHead
            data-role="data-grid-head"
            key={header.id}
            colSpan={header.colSpan}
            rowSpan={rowSpan}
            className={cn('group bg-table-head relative z-50 border-x-0 p-0')}
            align={header.column.columnDef.meta?.align}
            ref={(node) => columnSizingHandler(node, table, header.column)}
            style={{
              height: 'var(--header-row-height)',
              width: `var(--header-${header?.id}-size)`,
              ...computeStickyOffsetPosition(header?.column),
            }}
          >
            <TableCellHead header={header} />
            {table?.options?.enableColumnResizing && <ColumnResizer header={header} />}
          </TableHead>
        )
      })}
    </TableRow>
  )
}

TableHeaderRow.displayName = 'TableHeaderRow'

const TableHeaderFilterRow: React.FC<{ headerGroup: HeaderGroup<RowData> }> = ({ headerGroup }) => {
  //

  const { filterOpen } = useTableContext('filterOpen')
  const computeStickyOffsetPosition = useMemoizedFn(getStickyOffsetPosition)

  return (
    <TableRow data-role="data-grid-row" className="max-h-(--header-row-height,36px)">
      {headerGroup.headers.map((header) => {
        if (header.column.columns.length === 0)
          return (
            <TableHead
              key={header.id}
              colSpan={header.colSpan}
              data-role="data-grid-row"
              className="group relative z-40 p-0"
              rowSpan={header.column.getIsPinned() ? headerGroup.headers.length : 1}
              style={{
                ...computeStickyOffsetPosition(header?.column),
                borderBottomWidth: filterOpen ? '1px' : '0px',
                width: `var(--header-${header?.id}-size)`,
                maxHeight: 'var(--header-row-height)',
              }}
            >
              <div
                data-state={filterOpen ? 'open' : 'closed'}
                className="overflow-hidden transition-all transition-discrete duration-200 data-[state=closed]:h-0! data-[state=open]:h-(--header-row-height)"
              >
                <div className="h-(--header-row-height)">
                  <TableColumnFilter column={header.column} />
                </div>
              </div>
            </TableHead>
          )
      })}
    </TableRow>
  )
}

TableHeaderFilterRow.displayName = 'TableHeaderFilterRow'

const MemoizedDataTableHeader = memo(DataTableHeader) as typeof DataTableHeader

export { DataTableHeader, MemoizedDataTableHeader }
