import { POSITION_OPTIONS, WORK_STATUS_OPTIONS } from '@/apis/employee/constants'
import type { IEmployee } from '@/apis/employee/types'
import useMediaQuery from '@/hooks/use-media-query'
import tw from '@/lib/tw'
import type { Table } from '@tanstack/react-table'
import type { EventEmitter } from 'ahooks/lib/useEventEmitter'
import GlobalFilterInput from '../../shared/data-grid/components/global-filter-input'
import { DataTableFacetedFilter } from '../../shared/data-grid/components/table-faceted-filter'
import { Tooltip } from '../../shared/tooltip'
import { Button } from '../../ui/button'
import { Icon } from '../../ui/icon'
import EmployeeTableRefetchButton from './employee-table-refetch-button'
import { EmployeeTableViewOptions } from './employee-table-view-options'

const EmployeeTableToolbar: React.FC<{
  table: Table<IEmployee>
  event$: EventEmitter<Record<string, unknown>>
}> = ({ table }) => {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter

  return (
    <Toolbar>
      <ToolbarGroup className="md:flex-1 md:basis-full">
        <GlobalFilterInput table={table} />
        {table.getColumn('work_status') && (
          <DataTableFacetedFilter
            column={table.getColumn('work_status')}
            title="Trạng thái"
            options={WORK_STATUS_OPTIONS}
          />
        )}
        {table.getColumn('position') && (
          <DataTableFacetedFilter column={table.getColumn('position')} title="Vai trò" options={POSITION_OPTIONS} />
        )}
        {isFiltered && (
          <Tooltip
            message="Bỏ lọc"
            triggerProps={{
              render: (
                <Button
                  variant="secondary"
                  size={isMobile ? 'icon' : 'default'}
                  onClick={() => {
                    table.resetGlobalFilter()
                    table.resetColumnFilters()
                  }}
                >
                  {!isMobile && 'Bỏ lọc'} <Icon name="FunnelX" />
                </Button>
              ),
            }}
            contentProps={{ hidden: !isMobile }}
          />
        )}
      </ToolbarGroup>
      <ToolbarGroup className="ml-auto">
        <EmployeeTableRefetchButton />
        <EmployeeTableViewOptions table={table} />
      </ToolbarGroup>
    </Toolbar>
  )
}

const Toolbar: React.FC<React.ComponentProps<'div'>> = tw.div`flex items-stretch justify-between gap-x-2`
const ToolbarGroup: React.FC<React.ComponentProps<'div'>> = tw.div`flex items-center gap-x-2`

export default EmployeeTableToolbar
