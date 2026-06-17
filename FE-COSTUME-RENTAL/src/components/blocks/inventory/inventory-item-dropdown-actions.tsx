import { InventoryItemStatus } from '@/apis/inventory/constants'
import {
  useDeleteInventoryItemMutation,
  useUpdateInventoryItemStatusMutation,
} from '@/apis/inventory/hooks/use-inventory-request'
import type { ItemType } from '@/common/constants/enums'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EllipsisIcon } from 'lucide-react'

const InventoryItemDropdownActions: React.FC<{ sku: string; type: ItemType }> = ({ sku, type }) => {
  const { mutateAsync: updateStatus, isPending: isUpdatingStatus } = useUpdateInventoryItemStatusMutation(type)
  const { mutateAsync: deleteItem, isPending: isDeletingItem } = useDeleteInventoryItemMutation(type)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button aria-busy={isUpdatingStatus || isDeletingItem} variant="ghost" size="icon-sm">
            <EllipsisIcon />
          </Button>
        }
      />

      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Đánh dấu là</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => updateStatus({ sku, status: InventoryItemStatus.AVAILABLE })}>
            Tái nhập kho
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateStatus({ sku, status: InventoryItemStatus.MAINTENANCE })}>
            Bảo dưỡng
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateStatus({ sku, status: InventoryItemStatus.DISPOSED })}>
            Thanh lý
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => deleteItem(sku)}>Xóa</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default InventoryItemDropdownActions
