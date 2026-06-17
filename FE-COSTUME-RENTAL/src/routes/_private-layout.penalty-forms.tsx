import { getPenaltyFormsQueryOptions } from '@/apis/penalty-form/hooks/use-penalty-form-request'
import PenaltyFormsPage from '@/components/blocks/penalty-forms'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-layout/penalty-forms')({
  head: () => ({
    meta: [
      { title: 'Quản lý phiếu phạt' },
      {
        name: 'description',
        content: 'Theo dõi và xử lý các khoản phạt phát sinh từ mất mát hoặc hư hỏng sản phẩm.',
      },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(getPenaltyFormsQueryOptions())
  },
  component: PenaltyFormsPage,
})
