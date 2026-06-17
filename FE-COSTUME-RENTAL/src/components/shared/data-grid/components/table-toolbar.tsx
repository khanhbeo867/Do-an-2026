import { Tooltip } from '@/components/shared/tooltip'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { type Table } from '@tanstack/react-table'
import { useMemoizedFn } from 'ahooks'
import { pick } from 'lodash-es'
import { memo } from 'react'
import { ROW_ACTIONS_COLUMN_ID, ROW_EXPANSION_COLUMN_ID, ROW_SELECTION_COLUMN_ID } from '../constants'
import { useTableContext } from '../context/table.context'
import { type ToolbarProps } from '../types'
import ColumnFilterToggle from './column-filter-toggle'
import { GlobalFilterPopover } from './popover-global-filter'
import { TableViewOptions } from './table-view-options'

const TableToolbar: React.FC<ToolbarProps> = (props) => {
  const table = props['table'] as Table<any>
  const { event$ } = useTableContext('event$')
  const {
    columnPinning: { left, right },
    globalFilter,
    columnFilters,
  } = table.getState()
  const isFilterDirty = globalFilter?.length !== 0 || columnFilters?.length !== 0

  const isSomeColumnsPinned =
    left.some((columnId) => columnId !== ROW_SELECTION_COLUMN_ID && columnId !== ROW_EXPANSION_COLUMN_ID) ||
    right.some((columnId) => columnId !== ROW_ACTIONS_COLUMN_ID)

  const resetAllFilters = useMemoizedFn(() => {
    table.resetGlobalFilter(table.initialState.globalFilter)
    table.resetColumnFilters(true)
  })

  // Handle override case
  if (props.override === true) {
    return props.render({ table, event$ })
  }

  const { slotLeft: SlotLeft, slotRight: SlotRight, rtl } = props

  return (
    <div role="toolbar" className={cn('flex items-center justify-between py-0.5', rtl && 'flex-row-reverse')}>
      {SlotLeft && <SlotLeft table={table} />}
      <div className="ml-auto grid auto-cols-fr grid-flow-col items-center gap-x-1">
        <Tooltip
          message="Bỏ ghim tất cả cột"
          triggerProps={{
            render: (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  table.resetColumnPinning()
                  event$.emit(pick(table.getState(), ['columnPinning']))
                }}
                className={cn(!isSomeColumnsPinned && 'hidden')}
              >
                <Icon name={'PinOff'} />
              </Button>
            ),
          }}
        />
        <Tooltip
          message="Xóa lọc"
          triggerProps={{
            render: (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => resetAllFilters()}
                className={cn(!isFilterDirty && 'hidden')}
              >
                <Icon name={'FunnelX'} />
              </Button>
            ),
          }}
        />
        {SlotRight && <SlotRight table={table} />}
        {table.options.enableGlobalFilter && (
          <GlobalFilterPopover
            enableGlobalFilter={table.options.enableGlobalFilter}
            globalFilter={table.getState().globalFilter}
            onGlobalFilterChange={table.setGlobalFilter}
          />
        )}
        {table.getAllLeafColumns().some(({ columnDef }) => columnDef.enableColumnFilter) && <ColumnFilterToggle />}
        {(table.getAllLeafColumns().some(({ columnDef }) => columnDef.enableResizing) ||
          table.options.enableColumnResizing) && (
          <Tooltip
            message="Đặt lại kích thước cột"
            triggerProps={{
              render: (
                <Button variant="outline" size="icon" onClick={() => table.resetColumnSizing()}>
                  <Icon name={'FoldHorizontal'} />
                </Button>
              ),
            }}
          ></Tooltip>
        )}
        {table.options.enableHiding && <TableViewOptions />}
      </div>
    </div>
  )
}

TableToolbar.displayName = 'TableToolbar'

export default memo(
  TableToolbar,
  (_, nextProps) => nextProps['table'].getState().columnSizingInfo.isResizingColumn !== false
) as typeof TableToolbar
