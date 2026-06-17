import { z } from 'zod'
import { InventoryItemStatus } from '../constants'

export const updateInventoryItemConditionSchema = z.object({
  sku: z.string({ message: 'Thiếu SKU của sản phẩm' }),
  status: z.nativeEnum(InventoryItemStatus),
})

export type TUpdateInventoryItemConditionValues = z.infer<typeof updateInventoryItemConditionSchema>
