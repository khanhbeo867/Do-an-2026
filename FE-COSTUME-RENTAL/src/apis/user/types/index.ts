import type { UserRole } from '@/apis/auth/constants'
import type { IEmployee } from '@/apis/employee/types'

export interface IUser extends IBaseEntity {
  username: string
  email: string
  password: string
  role: UserRole
  avatar: string
  display_name: string
  employee: IEmployee
}
