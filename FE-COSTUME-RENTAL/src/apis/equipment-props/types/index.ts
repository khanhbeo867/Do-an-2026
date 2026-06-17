import type { ICategory } from '@/apis/category/types'
import type { IImage } from '@/apis/image/types'

export interface IEquipmentProps extends IBaseEntity {
  name: string
  slug: string
  category_id: number
  category: ICategory
  unit: string
  images: Array<IImage>
  price: number
  rental_price_per_day: number
  description: string
  hashtags: Array<string>
}
