import type { IconProps } from '@/components/ui/icon'

export enum InventoryItemStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
  DISPOSED = 'DISPOSED',
}

export const INVENTORY_ITEM_STATUS_LABELS: Map<InventoryItemStatus, { label: string; icon: IconProps['name'] }> =
  new Map([
    [InventoryItemStatus.AVAILABLE, { label: 'Còn hàng', icon: 'PackageCheck' }],
    [InventoryItemStatus.RENTED, { label: 'Đang cho thuê', icon: 'BookmarkCheck' }],
    [InventoryItemStatus.MAINTENANCE, { label: 'Bảo dưỡng', icon: 'Wrench' }],
    [InventoryItemStatus.DISPOSED, { label: 'Đã thanh lý', icon: 'PackageX' }],
  ])
