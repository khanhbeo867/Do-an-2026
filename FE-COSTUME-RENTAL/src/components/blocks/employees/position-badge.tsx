import { Position, POSITION_OPTIONS } from '@/apis/employee/constants'
import React from 'react'
import { Badge } from '../../ui/badge'
import { Icon } from '../../ui/icon'

const PositionBadge: React.FC<{ value: Position }> = ({ value }) => {
  const data = POSITION_OPTIONS.find((option) => option.value === value)

  return (
    <Badge variant="secondary" className="flex-nowrap whitespace-nowrap">
      <Icon name={data?.icon} strokeWidth={2} />
      {data?.label}
    </Badge>
  )
}

export default PositionBadge
