import { useCreateOrUpdateUserMutataion, useDeleteUserMutation } from '@/apis/user/hooks/use-user-request'
import type { IUser } from '@/apis/user/types'
import { CommonActions } from '@/common/constants/enums'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'
import { usePageEventContext } from '@/contexts/event-context'
import { useRouter } from '@tanstack/react-router'
import type { CellContext } from '@tanstack/react-table'
import { useState } from 'react'

const CustomerActionDropdown: React.FC<CellContext<IUser, any>> = ({ row }) => {
  const { event$ } = usePageEventContext()
  const [open, setOpen] = useState<boolean>(false)
  const router = useRouter()

  const { mutateAsync: updateAsync, isPending: isUpdating } = useCreateOrUpdateUserMutataion(CommonActions.UPDATE)
  const { mutateAsync: deleteUserAsync, isPending: isDeleting } = useDeleteUserMutation()

  const isPending = isUpdating || isDeleting

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground transition-colors duration-200 ease-in-out">
        <Icon name="Ellipsis" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() =>
              event$.emit({
                action: CommonActions.READ,
                payload: row.original,
              })
            }
          >
            Lịch sử giao dịch
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              event$.emit({
                action: CommonActions.UPDATE,
                payload: {
                  ...row.original,
                  employee: row.original.employee || null,
                },
              })
            }
          >
            Cập nhật
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              updateAsync({
                id: row.original.id,
                is_active: !row.original.is_active,
              }).then(() => router.invalidate())
            }}
          >
            {isUpdating && <Spinner />}
            {row.original.is_active ? 'Tạm khóa' : 'Mở khóa'}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isPending}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              deleteUserAsync(row.original.id)
            }}
          >
            {isDeleting && <Spinner />}
            Xóa tài khoản
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CustomerActionDropdown
