import { getImagesQueryOptions } from '@/apis/image/hooks/use-image-request'
import { searchImagesSchema } from '@/apis/image/schemas/search.schema'
import ImagesGalleryPage from '@/components/blocks/images-gallery'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-layout/images-gallery')({
  head: () => ({
    meta: [
      { title: 'Thư viện hình ảnh' },
      {
        name: 'description',
        content: 'Quản lý kho ảnh sản phẩm, hình minh họa và tài nguyên media cho hệ thống.',
      },
    ],
  }),
  component: ImagesGalleryPage,
  loader: async ({ context }) => {
    return await await context.queryClient.ensureQueryData(getImagesQueryOptions())
  },
  validateSearch: searchImagesSchema,
})
