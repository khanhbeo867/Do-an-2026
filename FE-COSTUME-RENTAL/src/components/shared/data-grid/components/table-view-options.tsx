import { Tooltip } from '@/components/shared/tooltip'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { useUpdate } from 'ahooks'
import { useTableContext } from '../context/table.context'

export const TableViewOptions: React.FC = () => {
  const { table } = useTableContext('table')

  const rerender = useUpdate()

  return (
    <DropdownMenu>
      <Tooltip
        message="Columns"
        triggerProps={{
          render: (
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}>
              <Icon name="Columns2" />
            </DropdownMenuTrigger>
          ),
        }}
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Hiển thị cột</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllLeafColumns()
          .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="whitespace-nowrap capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => {
                  column.toggleVisibility(!!value)
                  rerender()
                }}
              >
                {column.columnDef.header?.toString()}
              </DropdownMenuCheckboxItem>
            )
          })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="place-content-center gap-x-2 font-medium"
          onClick={() => {
            table.resetColumnVisibility()
            rerender()
          }}
        >
          <Icon name="Undo" />
          Đặt lại
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
