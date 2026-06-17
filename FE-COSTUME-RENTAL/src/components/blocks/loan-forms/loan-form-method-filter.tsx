import type { ILoanForm } from '@/apis/loan-form/types'
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
import { FileIcon } from 'lucide-react'
import React, { useMemo } from 'react'

type LoanMethodFilterValue = 'BUY' | 'RENT'

type DropdownOption = {
  label: string
  value: LoanMethodFilterValue
  count: number
}

const LoanFormMethodFilter: React.FC<{ table: Table<ILoanForm> }> = ({ table }) => {
  const { data } = table.options
  const currentFilterValue = table.getColumn('method')?.getFilterValue() as LoanMethodFilterValue | null | undefined

  const dropdownOptions: DropdownOption[] = useMemo(
    () => [
      {
        label: 'Phiếu mua',
        value: 'BUY',
        count: (data ?? []).filter((loan) => loan.method === 'BUY').length,
      },
      {
        label: 'Phiếu thuê',
        value: 'RENT',
        count: (data ?? []).filter((loan) => loan.method === 'RENT').length,
      },
    ],
    [data]
  )

  const handleValueChange = (value: LoanMethodFilterValue) => {
    table.getColumn('method')?.setFilterValue(value)
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
            <FileIcon /> Loại phiếu
            {typeof currentFilterValue === 'string' && (
              <div className="inline-flex items-center">
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge variant="secondary" className="mx-1 rounded-sm px-1.5 font-normal">
                  {currentFilterValue === 'BUY' ? 'Phiếu mua' : 'Phiếu thuê'}
                </Badge>
              </div>
            )}
          </div>
        }
      />
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuRadioGroup value={currentFilterValue ?? ''} onValueChange={handleValueChange}>
          {dropdownOptions.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value} className="gap-x-2">
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
          onClick={() => table.getColumn('method')?.setFilterValue(null)}
        >
          <Icon name="X" />
          Bỏ lọc
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LoanFormMethodFilter
