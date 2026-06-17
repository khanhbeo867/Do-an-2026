import { WORK_STATUS_OPTIONS, WorkStatus } from '@/apis/employee/constants'
import type { IEmployee } from '@/apis/employee/types'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Table } from '@tanstack/react-table'
import React, { useMemo } from 'react'

const EmployeeStatusFilter: React.FC<{ table: Table<IEmployee> }> = ({ table }) => {
  const { data } = table.options

  const currentFilterValue = table.getColumn('work_status')?.getFilterValue() as string | undefined

  const dropdownOptions = useMemo(
    () =>
      WORK_STATUS_OPTIONS.map((item) => ({
        ...item,
        count: data.filter((user) => user.work_status === item.value)?.length,
      })),
    [data]
  )

  const handleValueChange = (value: string) => {
    table.getColumn('work_status')?.setFilterValue(value)
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        role="button"
        nativeButton={false}
        aria-disabled={dropdownOptions.every((option) => option.count === 0)}
        render={
          <div
            className={cn(
              buttonVariants({
                variant: 'outline',
                className: 'bg-background border-dashed',
              })
            )}
          >
            <Icon name="CircleFadingPlus" /> Trạng thái
            {typeof currentFilterValue === 'boolean' && (
              <div className="inline-flex items-center">
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge variant="secondary" className="mx-1 rounded-sm px-1.5 font-normal">
                  {currentFilterValue ? 'Đang hoạt động' : 'Tạm khóa'}
                </Badge>
              </div>
            )}
          </div>
        }
      />
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuRadioGroup value={currentFilterValue} onValueChange={handleValueChange}>
          {dropdownOptions.map((option) => (
            <DropdownMenuRadioItem key={option.label} value={option.value} className="gap-x-2">
              <Icon
                name={option.icon}
                className={cn('size-4', {
                  'stroke-success': option.value === WorkStatus.ACTIVE,
                  'stroke-muted-foreground': option.value === WorkStatus.SUSPENDED,
                  'stroke-destructive': option.value === WorkStatus.EXITED,
                })}
              />
              {option.label}
              <Badge variant="outline" className="ml-auto font-normal">
                {option.count}
              </Badge>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          // disabled={!table.getColumn('work_status')?.getFilterValue()}
          className="justify-center gap-x-2"
          onClick={() => table.getColumn('work_status')?.setFilterValue(null)}
        >
          <Icon name="X" />
          Bỏ lọc
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default EmployeeStatusFilter
