import type { IEquipmentProps } from '@/apis/equipment-props/types'
import { CommonActions } from '@/common/constants/enums'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { usePageEventContext } from '@/contexts/event-context'
import type { CellContext } from '@tanstack/react-table'
import { Ellipsis, Eye, Pencil, Trash2 } from 'lucide-react'
import React from 'react'

const EquipmentPropsDropdownOptions: React.FC<CellContext<IEquipmentProps, any>> = ({ row }) => {
  const { event$ } = usePageEventContext()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 rounded-full hover:bg-muted transition-colors cursor-pointer">
          <Ellipsis size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => event$.emit({ action: CommonActions.READ, payload: row.original.description })}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Eye size={14} className="text-muted-foreground" />
          Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => event$.emit({ action: CommonActions.UPDATE, payload: row.original })}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Pencil size={14} className="text-muted-foreground" />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => event$.emit({ action: CommonActions.DELETE, payload: row.original.id })}
          className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
        >
          <Trash2 size={14} className="text-destructive" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default EquipmentPropsDropdownOptions
