import { getEmployeeQueryOptions } from '@/apis/employee/hooks/use-employee-request'
import EmployeePage from '@/components/blocks/employees'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-layout/employees')({
  component: EmployeePage,
  head: () => ({
    meta: [
      { title: 'Quản lý nhân sự' },
      {
        name: 'description',
        content: `Hệ thống quản lý danh bạ nhân sự toàn diện — lưu trữ, tìm kiếm và cập nhật thông tin liên lạc của toàn bộ nhân viên một cách nhanh chóng, chính xác và bảo mật. Tối ưu hóa quy trình quản lý nội bộ, giúp doanh nghiệp kết nối hiệu quả hơn.`,
      },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(getEmployeeQueryOptions())
  },
})
