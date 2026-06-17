import { getLoanFormsQueryOptions } from '@/apis/loan-form/hooks/use-loan-form-request'
import LoanFormsPage from '@/components/blocks/loan-forms'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-layout/loan-forms/')({
  head: () => ({
    meta: [
      { title: 'Danh sách phiếu thuê và mua' },
      {
        name: 'description',
        content: 'Xem, lọc và quản trị toàn bộ phiếu thuê/mua đang hoạt động và lịch sử.',
      },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(getLoanFormsQueryOptions())
  },
  component: LoanFormsPage,
})
