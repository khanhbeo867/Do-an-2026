import { ItemType } from '@/common/constants/enums'
import z from 'zod'

export const getCategoryQuerySchema = z
  .object({
    'type:eq': z.nativeEnum(ItemType),
    _embed: z.enum(['costumes', 'equipment_props', 'costumes,equipment_props']).optional(),
  })
  .nullish()

export type TGetCategoryQueryValue = z.infer<typeof getCategoryQuerySchema>
