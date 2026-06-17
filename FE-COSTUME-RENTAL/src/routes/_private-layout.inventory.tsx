import {
  getCostumeInventoryQueryOptions,
  getPropsInventoryQueryOptions,
} from '@/apis/inventory/hooks/use-inventory-request'
import { inventoryPageSearchSchema } from '@/apis/inventory/schemas/search.schema'
import { getWarehousesQueryOptions } from '@/apis/warehouse/hooks/use-warehouse-request'
import InventoryPage from '@/components/blocks/inventory'
import { ErrorBoundaryFallback } from '@/components/errors/error-boundary-fallback'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-layout/inventory')({
  head: () => ({
    meta: [
      { title: 'Quản lý tồn kho' },
      {
        name: 'description',
        content: 'Theo dõi tồn kho trang phục và đạo cụ theo kho, trạng thái và biến động nhập xuất.',
      },
    ],
  }),
  component: InventoryPage,
  validateSearch: inventoryPageSearchSchema,
  loader: async ({ context }) => {
    return await Promise.all([
      context.queryClient.ensureQueryData(getWarehousesQueryOptions()),
      context.queryClient.ensureQueryData(getCostumeInventoryQueryOptions()),
      context.queryClient.ensureQueryData(getPropsInventoryQueryOptions()),
    ])
  },
  errorComponent: ErrorBoundaryFallback,
})
