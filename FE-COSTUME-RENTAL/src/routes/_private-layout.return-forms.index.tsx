import { getReturnFormsQueryOptions } from '@/apis/return-form/hooks/use-return-form-request'
import ReturnFormsPage from '@/components/blocks/return-forms'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-layout/return-forms/')({
  head: () => ({
    meta: [
      { title: 'Danh sách phiếu trả' },
      {
        name: 'description',
        content: 'Xem và quản lý toàn bộ phiếu trả sản phẩm, trạng thái xử lý và lịch sử hoàn tất.',
      },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(getReturnFormsQueryOptions())
  },
  component: ReturnFormsPage,
})
