import { useTableContext } from '@/components/shared/data-grid/context/table.context'
import { Tooltip } from '@/components/shared/tooltip'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'
import useMediaQuery from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

export function ColumnViewOptions() {
  const { table } = useTableContext('table')
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <DropdownMenu>
      <Tooltip
        message="Thiết lập cột"
        contentProps={{ hidden: !isMobile }}
        triggerProps={{
          render: (
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({
                  variant: isMobile ? 'ghost' : 'outline',
                  size: isMobile ? 'icon' : 'default',
                })
              )}
            >
              <Icon name="Columns2" />
              {!isMobile && 'Thiết lập cột'}
            </DropdownMenuTrigger>
          ),
        }}
      />
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Tùy chỉnh hiển thị</DropdownMenuLabel>
          {table
            .getAllColumns()
            .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.columnDef.header?.toString()}
                </DropdownMenuCheckboxItem>
              )
            })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
