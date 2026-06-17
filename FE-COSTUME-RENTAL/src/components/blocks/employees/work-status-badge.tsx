import { WORK_STATUS_OPTIONS, WorkStatus } from '@/apis/employee/constants'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import React from 'react'

const WorkStatusBadge: React.FC<{ value: WorkStatus }> = ({ value }) => {
  const data = WORK_STATUS_OPTIONS.find((option) => option.value === value)

  return (
    <Badge variant="outline" className="flex-nowrap whitespace-nowrap">
      <Icon name={data?.icon} strokeWidth={2} stroke={data?.color} />
      {data?.label}
    </Badge>
  )
}

export default WorkStatusBadge
