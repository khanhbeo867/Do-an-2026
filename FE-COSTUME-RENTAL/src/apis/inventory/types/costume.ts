import type { CostumeSize } from '@/apis/costume/constants'
import type { ICostume } from '@/apis/costume/types'
import type { IWarehouse } from '@/apis/warehouse/types'
import type { ItemType } from '@/common/constants/enums'
import type { InventoryItemStatus } from '../constants'

export interface ICostumeInventoryItem extends IBaseEntity {
  sku: string
  size: CostumeSize
  status: InventoryItemStatus
  warehouse: Pick<IWarehouse, 'id' | 'name'>
}

export interface ICostumeInventoryEntity extends IBaseEntity {
  sku: string
  item_id: number
  item_type: ItemType
  // inventory_condition: IInventoryCondition
  warehouse_id: number
  status: InventoryItemStatus
  size: CostumeSize
}

export interface ICostumeInventory extends Pick<
  ICostume,
  'id' | 'sizes' | 'name' | 'slug' | 'color' | 'gender' | 'category' | 'images' | 'unit' | 'price'
> {
  // inventory_condition: IInventoryCondition
  item_type: ItemType
  in_stock: boolean
  rental_price_per_day: number
  details: ICostumeInventoryItem[]
}
