import { UserRole } from '@/apis/auth/constants'
import type { IconProps } from '@/components/ui/icon'

export const PHONE_REGEX = /^\d{10}$/

export const ROLE_OPTIONS: Array<{
  label: string
  value: UserRole
  icon: IconProps['name']
}> = [
  {
    label: 'Quản trị viên',
    value: UserRole.ADMIN,
    icon: 'UserStar',
  },
  {
    label: 'Thành viên',
    value: UserRole.USER,
    icon: 'UserCheck',
  },
]
