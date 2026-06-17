import { CostumeGender } from '@/apis/costume/constants'
import { ItemType } from '@/common/constants/enums'
import { z } from 'zod'

export const searchProductSchema = z.object({
  item_type: z.nativeEnum(ItemType).optional().default(ItemType.COSTUME),
  'category_slug:eq': z.string().optional(),
  'rental_price_per_day:gte': z.number().optional(),
  'rental_price_per_day:lte': z.number().optional(),
  'color:eq': z.string().optional(),
  'size:in': z.string().optional(),
  'gender:eq': z.nativeEnum(CostumeGender).optional(),
  _sort: z.string().optional(),
  q: z.string().optional(),
})

export type TSearchProductValues = z.infer<typeof searchProductSchema>
