import { getCategoriesQueryOptions } from '@/apis/category/hooks/use-category-request'
import { getCostumesQueryOptions } from '@/apis/costume/hooks/use-costume-request'
import { getPropsQueryOptions } from '@/apis/equipment-props/hooks/use-equipment-props-request'
import { searchProductSchema } from '@/apis/product/schemas/product.schema'
import ProductPage from '@/components/blocks/products'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public-layout/products/')({
  component: ProductPage,
  validateSearch: searchProductSchema,
  preloadStaleTime: 1000 * 60 * 5,
  staleTime: 30 * 1000,
  loader: async ({ context }) => {
    return await Promise.all([
      context.queryClient.ensureQueryData(getCategoriesQueryOptions()),
      context.queryClient.ensureQueryData(getCostumesQueryOptions()),
      context.queryClient.ensureQueryData(getPropsQueryOptions()),
    ])
  },
  head: ({ loaderData }) => {
    const categories = loaderData ? loaderData[0] : null
    const costumes = loaderData ? loaderData[1] : null
    const props = loaderData ? loaderData[2] : null

    return {
      meta: [
        { title: 'Sản phẩm' },
        {
          name: 'description',
          content: 'Danh mục trang phục và đạo cụ cho thuê với bộ lọc theo loại, mức giá và thuộc tính sản phẩm.',
        },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: [
              ...(categories?.map((category) => ({
                '@type': 'ListItem',
                name: category.name,
                item: `https://diamond-studio-vmu.vercel.app/products?category=${category.id}`,
              })) || []),
              ...(costumes?.map((costume) => ({
                '@type': 'ListItem',
                name: costume.name,
                item: `https://diamond-studio-vmu.vercel.app/products?costume=${costume.id}`,
              })) || []),
              ...(props?.map((prop) => ({
                '@type': 'ListItem',
                name: prop.name,
                item: `https://diamond-studio-vmu.vercel.app/products?equipment_prop=${prop.id}`,
              })) || []),
            ],
          }),
        },
      ],
    }
  },
})
