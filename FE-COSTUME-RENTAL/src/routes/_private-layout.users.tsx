import { Position, WorkStatus } from '@/apis/employee/constants'
import { getEmployeeQueryOptions } from '@/apis/employee/hooks/use-employee-request'
import { getUsersQueryOptions } from '@/apis/user/hooks/use-user-request'
import UserPage from '@/components/blocks/users'

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-layout/users')({
  component: UserPage,
  head: () => ({
    meta: [{ name: 'description', content: 'Quản lý truy cập' }, { title: 'Quản lý truy cập' }],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getUsersQueryOptions()),
      context.queryClient.ensureQueryData(
        getEmployeeQueryOptions({
          'position:in': `${Position.MANAGER},${Position.ORDER_PROCESSOR},${Position.WAREHOUSE_MANAGER}`,
          'is_active:eq': true,
          'work_status:ne': WorkStatus.EXITED,
          'user_id:eq': null,
        })
      ),
    ])
  },
})
