import type { ICostume } from '@/apis/costume/types'
import { CommonActions } from '@/common/constants/enums'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { usePageEventContext } from '@/contexts/event-context'
import type { CellContext } from '@tanstack/react-table'
import { Ellipsis } from 'lucide-react'
import React from 'react'

const CostumeDropdownOptions: React.FC<CellContext<ICostume, any>> = ({ row }) => {
  const { event$ } = usePageEventContext()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Ellipsis size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuItem
          onClick={() => event$.emit({ action: CommonActions.READ, payload: row.original.description })}
        >
          Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => event$.emit({ action: CommonActions.UPDATE, payload: row.original })}>
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => event$.emit({ action: CommonActions.DELETE, payload: row.original.id })}>
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CostumeDropdownOptions
