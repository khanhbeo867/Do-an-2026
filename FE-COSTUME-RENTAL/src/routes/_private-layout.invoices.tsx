import { getInvoicesQueryOptions } from '@/apis/invoice/hooks/use-invoice-request'
import InvoicesPage from '@/components/blocks/invoices'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-layout/invoices')({
  head: () => ({
    meta: [
      { title: 'Quản lý hóa đơn' },
      {
        name: 'description',
        content: 'Theo dõi, đối soát và quản lý hóa đơn phát sinh từ các giao dịch thuê trang phục.',
      },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(getInvoicesQueryOptions())
  },
  component: InvoicesPage,
})
