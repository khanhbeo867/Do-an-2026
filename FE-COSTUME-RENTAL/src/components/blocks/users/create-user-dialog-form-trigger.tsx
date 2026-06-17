import { CommonActions } from '@/common/constants/enums'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { usePageEventContext } from '@/contexts/event-context'
import type { ButtonProps } from 'react-day-picker'

const CreateUserFormDialogTrigger: React.FC<ButtonProps> = (props) => {
  const { event$ } = usePageEventContext()

  return (
    <Button {...props} onClick={() => event$.emit({ action: CommonActions.CREATE })}>
      <Icon name="Plus" />
      Thêm người dùng
    </Button>
  )
}

export default CreateUserFormDialogTrigger
