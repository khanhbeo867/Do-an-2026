import { getStatisticsQueryOptions } from '@/apis/statistics/hooks/use-statistics-request'
import StatisticsPage from '@/components/blocks/statistics'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-layout/statistics')({
  head: () => ({
    meta: [
      { title: 'Thống kê vận hành' },
      {
        name: 'description',
        content: 'Báo cáo doanh thu, đơn mới, đơn quá hạn, cảnh báo đến hạn và top sản phẩm thuê theo thời gian.',
      },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(getStatisticsQueryOptions({ range: '7d', method: 'ALL' }))
  },
  component: StatisticsPage,
})
