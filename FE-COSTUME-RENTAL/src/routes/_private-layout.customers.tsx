import { getEmployeeQueryOptions } from '@/apis/employee/hooks/use-employee-request'
import { getUsersQueryOptions } from '@/apis/user/hooks/use-user-request'
import CustomerPage from '@/components/blocks/customers'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-layout/customers')({
  component: CustomerPage,
  head: () => ({
    meta: [{ name: 'description', content: 'Quản lý khách hàng' }, { title: 'Quản lý khách hàng' }],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getUsersQueryOptions()),
      context.queryClient.ensureQueryData(
        getEmployeeQueryOptions({
          'is_active:eq': true,
          'user_id:eq': null,
        })
      ),
    ])
  },
})
