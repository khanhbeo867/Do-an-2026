import type { ICostume } from '@/apis/costume/types'
import type { IProduct } from '@/apis/product/types'
import type { ItemType } from '@/common/constants/enums'

export interface ICategory extends IBaseEntity {
  name: string
  slug: string
  type: ItemType
  costumes?: Array<ICostume>
  equipment_props?: Array<ICostume>
  products?: Array<IProduct>
}
