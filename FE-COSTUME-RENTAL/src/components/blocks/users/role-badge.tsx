import { UserRole } from '@/apis/auth/constants'
import { ROLE_OPTIONS } from '@/apis/user/constants'
import React from 'react'
import { Badge } from '../../ui/badge'
import { Icon } from '../../ui/icon'

const RoleBadge: React.FC<{ value: UserRole }> = ({ value }) => {
  const roleData = ROLE_OPTIONS.find((option) => option.value === value)

  return (
    <Badge variant="secondary" className="flex-nowrap whitespace-nowrap">
      <Icon name={roleData?.icon!} strokeWidth={2} />
      {roleData?.label}
    </Badge>
  )
}

export default RoleBadge
