import { z } from 'zod'
import { createWarehouseSchema } from './create-warehouse.schema'

export const updateWarehouseSchema = z
  .object(createWarehouseSchema.shape)
  .partial()
  .extend({ id: z.number(), is_active: z.boolean().optional() })

export type TUpdateWarehouseSchema = typeof updateWarehouseSchema

export type TUpdateWarehouseValues = z.infer<TUpdateWarehouseSchema>
