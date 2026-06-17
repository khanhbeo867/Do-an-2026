import { CommonActions } from '@/common/constants/enums'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { usePageEventContext } from '@/contexts/event-context'
import type { ButtonProps } from 'react-day-picker'

const CreateEmployeeFormDialogTrigger: React.FC<ButtonProps> = (props) => {
  const { event$ } = usePageEventContext()

  return (
    <Button type="button" {...props} onClick={() => event$.emit({ action: CommonActions.CREATE })}>
      <Icon name="Plus" />
      Thêm nhân viên
    </Button>
  )
}

export default CreateEmployeeFormDialogTrigger
