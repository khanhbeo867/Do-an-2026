import { GET_COSTUME_CATEGORY_QUERY_KEY, getCategoriesQueryOptions } from '@/apis/category/hooks/use-category-request'
import { getCostumesQueryOptions } from '@/apis/costume/hooks/use-costume-request'
import { getImagesQueryOptions } from '@/apis/image/hooks/use-image-request'
import CostumePage from '@/components/blocks/costumes'

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-layout/costumes')({
  head: () => ({
    meta: [
      { title: 'Quản lý trang phục' },
      {
        name: 'description',
        content: `Quản lý trang phục: thêm, sửa, xóa trang phục, phân loại theo loại, kích cỡ, màu sắc và tình trạng để vận hành hiệu quả.`,
      },
    ],
  }),
  component: Page,
  loader: async ({ context }) => {
    return await Promise.all([
      context.queryClient.ensureQueryData(getCategoriesQueryOptions(GET_COSTUME_CATEGORY_QUERY_KEY)),
      context.queryClient.ensureQueryData(getCostumesQueryOptions()),
      context.queryClient.ensureQueryData(getImagesQueryOptions()),
    ])
  },
})

function Page() {
  return <CostumePage />
}
