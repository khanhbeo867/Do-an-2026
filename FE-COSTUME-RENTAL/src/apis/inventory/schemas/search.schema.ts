import { z } from 'zod'

export const inventoryPageSearchSchema = z.object({
  tab: z.enum(['all-warehouses', 'costume-warehouse', 'props-warehouse']).default('all-warehouses'),
})

export type TInventorySearchValues = z.infer<typeof inventoryPageSearchSchema>
