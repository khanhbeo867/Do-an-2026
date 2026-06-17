import type { IEmployee } from '@/apis/employee/types'
import type { ItemType } from '@/common/constants/enums'

export interface IWarehouse extends IBaseEntity {
  name: string
  type: ItemType
  manager: IEmployee
}
