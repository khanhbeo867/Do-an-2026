import { CommonActions } from '@/common/constants/enums'
import { Button } from '@/components/ui/button'
import { usePageEventContext } from '@/contexts/event-context'
import type { ButtonProps } from '@base-ui/react'
import { CircleFadingPlus } from 'lucide-react'
import React from 'react'

const EquipmentPropsFormDialogTrigger: React.FC<ButtonProps> = (props) => {
  const { event$ } = usePageEventContext()

  return (
    <Button {...props} onClick={() => event$.emit({ action: CommonActions.CREATE })}>
      <CircleFadingPlus />
      Thêm đạo cụ
    </Button>
  )
}

export default EquipmentPropsFormDialogTrigger
