// import { useUpdateUserStatusMutation } from '@/apis/user/hooks/use-user-request'
import { WorkStatus } from '@/apis/employee/constants'
import { useCreateOrUpdateEmployeeMutataion } from '@/apis/employee/hooks/use-employee-request'
import type { TUpdateEmployeeValues } from '@/apis/employee/schemas/update-employee.schema'
import type { IEmployee } from '@/apis/employee/types'
import { CommonActions } from '@/common/constants/enums'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'
import { usePageEventContext } from '@/contexts/event-context'
import type { CellContext } from '@tanstack/react-table'
import { useState } from 'react'

const EmployeeActionDropdown: React.FC<CellContext<IEmployee, any>> = ({ row }) => {
  const { event$ } = usePageEventContext()
  const [open, setOpen] = useState<boolean>(false)

  const { mutateAsync: updateUserStatusAsync, isPending: isUpdatingStatus } = useCreateOrUpdateEmployeeMutataion(
    CommonActions.UPDATE
  )

  return (
    <DropdownMenu open={open || isUpdatingStatus} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground transition-colors duration-200 ease-in-out">
        <Icon name="Ellipsis" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" align="start" className="w-48">
        <DropdownMenuItem
          onClick={() =>
            event$.emit({
              action: CommonActions.UPDATE,
              payload: {
                ...row.original,
              },
            })
          }
        >
          Cập nhật
        </DropdownMenuItem>
        {/* <DropdownMenuItem
					disabled={isUpdatingStatus}
					onClick={async () => {
						await updateUserStatusAsync({
							id: row.original.id,
							is_active: !row.original.is_active
						} as TUpdateEmployeeValues)
					}}
				>
					{isUpdatingStatus && <Spinner />}
					{row.original.is_active ? 'Tạm khóa' : 'Mở khóa'}
				</DropdownMenuItem> */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={isUpdatingStatus}>
            {isUpdatingStatus && <Spinner />} Trạng thái làm việc
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent side="left" className="w-40">
              <DropdownMenuRadioGroup
                value={row.original.work_status}
                onValueChange={async (value) => {
                  await updateUserStatusAsync({
                    id: row.original.id,
                    work_status: value,
                  } as TUpdateEmployeeValues)
                }}
              >
                <DropdownMenuRadioItem value={WorkStatus.ACTIVE}>Đang làm việc</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={WorkStatus.SUSPENDED}>Tạm hoãn</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={WorkStatus.EXITED}>Thôi việc</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default EmployeeActionDropdown
