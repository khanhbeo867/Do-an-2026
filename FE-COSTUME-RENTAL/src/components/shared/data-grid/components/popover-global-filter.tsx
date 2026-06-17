import { DebouncedInput } from '@/components/shared/debounced-input'
import { Tooltip } from '@/components/shared/tooltip'
import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { type Table } from '@tanstack/react-table'
import { pick } from 'lodash-es'
import { useTableContext } from '../context/table.context'

type GlobalFilterPopoverProps = {
  enableGlobalFilter: boolean
  globalFilter: ReturnType<Table<unknown>['getState']>['globalFilter']
  onGlobalFilterChange: Table<unknown>['setGlobalFilter']
}

export const GlobalFilterPopover: React.FC<GlobalFilterPopoverProps> = ({
  enableGlobalFilter,
  globalFilter,
  onGlobalFilterChange,
}) => {
  const { table, event$ } = useTableContext('table', 'event$')
  if (!enableGlobalFilter) return null

  return (
    <Popover>
      <Tooltip
        message="Tìm kiếm"
        triggerProps={{
          render: (
            <PopoverTrigger className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}>
              <Icon name="Search" />
            </PopoverTrigger>
          ),
        }}
      />

      <PopoverContent align="end" side="left" sideOffset={4} className="relative w-64 p-0">
        <Icon name={'Search'} className="absolute top-1/2 left-2 -translate-y-1/2" />
        <DebouncedInput
          value={globalFilter}
          onChange={(value) => {
            event$.emit(pick(table.getState(), ['rowSelection']))
            onGlobalFilterChange(String(value))
          }}
          className="font-lg border p-2 pl-8 placeholder:text-sm"
          placeholder="Tìm kiếm..."
          type="search"
        />
      </PopoverContent>
    </Popover>
  )
}
