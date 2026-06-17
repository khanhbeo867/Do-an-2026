import { getPropsQueryOptions } from '@/apis/equipment-props/hooks/use-equipment-props-request'
import EquipmentPropsPage from '@/components/blocks/equipment-props'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-layout/equipment-props')({
  head: () => ({
    meta: [
      { title: 'Quản lý đạo cụ' },
      {
        name: 'description',
        content: 'Quản lý danh mục đạo cụ phục vụ cho hoạt động thuê và mua trong hệ thống.',
      },
    ],
  }),
  component: EquipmentPropsPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(getPropsQueryOptions())
  },
})
