import { UserRole } from '@/apis/auth/constants'
import { ROLE_OPTIONS } from '@/apis/user/constants'
import type { IUser } from '@/apis/user/types'
import useMediaQuery from '@/hooks/use-media-query'
import tw from '@/lib/tw'
import type { Column, Table } from '@tanstack/react-table'
import type { EventEmitter } from 'ahooks/lib/useEventEmitter'
import GlobalFilterInput from '../../shared/data-grid/components/global-filter-input'
import { DataTableFacetedFilter } from '../../shared/data-grid/components/table-faceted-filter'
import { Tooltip } from '../../shared/tooltip'
import { Button } from '../../ui/button'
import { Icon } from '../../ui/icon'
import UserStatusFilter from './user-status-filter'
import UserTableRefetchButton from './user-table-refetch-button'
import { UserTableViewOptions } from './user-table-view-options'

const UserTableToolbar: React.FC<{
  table: Table<IUser>
  event$: EventEmitter<Record<string, unknown>>
}> = ({ table }) => {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter

  return (
    <Toolbar>
      <ToolbarGroup className="md:flex-1 md:basis-full">
        <GlobalFilterInput table={table} />
        <UserStatusFilter table={table} />
        {table.getColumn('role') && (
          <DataTableFacetedFilter
            column={table.getColumn('role') as Column<IUser, UserRole>}
            title="Vai trò"
            options={ROLE_OPTIONS}
          />
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
        <UserTableRefetchButton />
        <UserTableViewOptions table={table} />
      </ToolbarGroup>
    </Toolbar>
  )
}

const Toolbar: React.FC<React.ComponentProps<'div'>> = tw.div`flex items-stretch justify-between gap-x-2`
const ToolbarGroup: React.FC<React.ComponentProps<'div'>> = tw.div`flex items-center gap-x-2`

export default UserTableToolbar
