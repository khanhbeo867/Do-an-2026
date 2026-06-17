import type { IUser } from '@/apis/user/types'
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
import { Icon, type IconProps } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Table } from '@tanstack/react-table'
import React, { useMemo } from 'react'

type DropdownOption = {
  label: string
  value: boolean
  icon: IconProps['name']
  count: number
}

const CustomerStatusFilter: React.FC<{ table: Table<IUser> }> = ({ table }) => {
  const { data } = table.options

  const currentFilterValue = table?.getColumn?.('is_active')?.getFilterValue() as boolean | undefined

  const dropdownOptions: DropdownOption[] = useMemo(
    () =>
      [
        {
          label: 'Đang hoạt động',
          value: true,
          icon: 'CircleCheck' as const,
        },
        {
          label: 'Tạm khóa',
          value: false,
          icon: 'CircleMinus' as const,
        },
      ].map((item) => ({
        ...item,
        count: data.filter((user) => user.is_active === item.value).length,
      })),
    [data]
  )

  const handleValueChange = (value: string) => {
    table.getColumn('is_active')?.setFilterValue(value === 'true')
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        nativeButton={false}
        role="button"
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
        <DropdownMenuRadioGroup value={String(currentFilterValue)} onValueChange={handleValueChange}>
          {dropdownOptions.map((option) => (
            <DropdownMenuRadioItem key={option.label} value={String(option.value)} className="gap-x-2">
              <Icon
                name={option.icon}
                className={cn('size-4', {
                  'stroke-success': option.value === true,
                  'stroke-muted-foreground': option.value === false,
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
          className="justify-center gap-x-2"
          onClick={() => table.getColumn('is_active')?.setFilterValue(null)}
        >
          <Icon name="X" />
          Bỏ lọc
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CustomerStatusFilter
