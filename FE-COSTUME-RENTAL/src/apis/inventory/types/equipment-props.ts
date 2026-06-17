import type { IEquipmentProps } from '@/apis/equipment-props/types'
import type { IWarehouse } from '@/apis/warehouse/types'
import type { ItemType } from '@/common/constants/enums'
import type { InventoryItemStatus } from '../constants'
import type { IInventoryCondition } from './condition'

export interface IInventoryItem extends IBaseEntity {
  sku: string
  status: InventoryItemStatus
  warehouse: Pick<IWarehouse, 'id' | 'name'>
}

export interface IEquipmentPropsInventory extends Pick<
  IEquipmentProps,
  'id' | 'name' | 'category' | 'images' | 'unit' | 'price'
> {
  inventory_condition: IInventoryCondition
  item_type: ItemType
  in_stock: boolean
  rental_price_per_day: number
  details: IInventoryItem[]
}
