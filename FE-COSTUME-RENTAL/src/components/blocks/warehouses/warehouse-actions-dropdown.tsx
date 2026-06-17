import {
  useCreateOrUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} from '@/apis/warehouse/hooks/use-warehouse-request'
import type { IWarehouse } from '@/apis/warehouse/types'
import { CommonActions } from '@/common/constants/enums'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import type { CellContext } from '@tanstack/react-table'
import { pick } from 'lodash-es'
import { EllipsisVerticalIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { usePubSub } from '.'
import { WAREHOUSE_TYPE_OPTIONS } from './constant'

const WarehouseActionsDropdown: React.FC<CellContext<IWarehouse, unknown>> = ({ row }) => {
  const { publish } = usePubSub()
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useDeleteWarehouseMutation()
  const { mutateAsync: updateAsync, isPending: isUpdating } = useCreateOrUpdateWarehouseMutation(CommonActions.UPDATE)

  const handleUpdateStatus = async () => {
    try {
      if (!row.original.is_active) await updateAsync({ id: row.original.id, is_active: true })
      else await deleteAsync({ id: row.original.id, permanantly: false })
      toast.success('Đã cập nhật lại trạng thái sử dụng')
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    }
  }

  const isPending = isDeleting || isUpdating

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}>
        <EllipsisVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit">
        <DropdownMenuItem
          onClick={() =>
            publish('warehouse:update', {
              ...row.original,
              managed_by: pick(row.original.manager, ['id', 'full_name']),
              type: pick(WAREHOUSE_TYPE_OPTIONS.find((opt) => opt.value === row.original.type)!, ['label', 'value']),
            })
          }
        >
          Cập nhật
        </DropdownMenuItem>
        <DropdownMenuItem disabled={isPending} onClick={handleUpdateStatus}>
          {isUpdating && <Spinner />}
          {row.original.is_active ? 'Dừng hoạt động' : 'Đưa vào sử dụng'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={isPending} onClick={() => publish('warehouse:delete', row.original.id)}>
          {isDeleting && <Spinner />}
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default WarehouseActionsDropdown
