import type { IUser } from '@/apis/user/types'
import useMediaQuery from '@/hooks/use-media-query'
import tw from '@/lib/tw'
import type { Table } from '@tanstack/react-table'
import type { EventEmitter } from 'ahooks/lib/useEventEmitter'
import GlobalFilterInput from '../../shared/data-grid/components/global-filter-input'
import { Tooltip } from '../../shared/tooltip'
import { Button } from '../../ui/button'
import { Icon } from '../../ui/icon'
import CustomerStatusFilter from './customer-status-filter'
import CustomerTableRefetchButton from './customer-table-refetch-button'
import { CustomerTableViewOptions } from './customer-table-view-options'

const CustomerTableToolbar: React.FC<{
  table: Table<IUser>
  event$: EventEmitter<Record<string, unknown>>
}> = ({ table }) => {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter

  return (
    <Toolbar>
      <ToolbarGroup className="md:flex-1 md:basis-full">
        <GlobalFilterInput table={table} />
        <CustomerStatusFilter table={table} />
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
        <CustomerTableRefetchButton />
        <CustomerTableViewOptions table={table} />
      </ToolbarGroup>
    </Toolbar>
  )
}

const Toolbar: React.FC<React.ComponentProps<'div'>> = tw.div`flex items-stretch justify-between gap-x-2`
const ToolbarGroup: React.FC<React.ComponentProps<'div'>> = tw.div`flex items-center gap-x-2`

export default CustomerTableToolbar
