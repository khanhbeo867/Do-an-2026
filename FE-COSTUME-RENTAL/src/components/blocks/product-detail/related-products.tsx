import { getOneCategoryQueryOptions } from '@/apis/category/hooks/use-category-request'
import type { ICategory } from '@/apis/category/types'
import { ItemType } from '@/common/constants/enums'
import { buttonVariants } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowRightIcon, PackageSearchIcon } from 'lucide-react'
import { Suspense } from 'react'
import ProductCard from '../products/product-card'

const RelatedProducts: React.FC<{ category: ICategory }> = ({ category }) => {
  const { data } = useSuspenseQuery(
    getOneCategoryQueryOptions(category?.id, category?.type === ItemType.COSTUME ? 'costumes' : 'equipment_props')
  )

  return (
    <Suspense>
      <Carousel opts={{ loop: true, slidesToScroll: 1, align: 'center' }}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Typography variant="h2">Có thể bạn quan tâm</Typography>
            <div className="flex items-center gap-3">
              <CarouselPrevious
                variant="default"
                className="disabled:bg-primary/10 disabled:text-primary static size-9 translate-y-0 rounded-full disabled:opacity-100"
              />
              <CarouselNext
                variant="default"
                className="disabled:bg-primary/10 disabled:text-primary static size-9 translate-y-0 rounded-full disabled:opacity-100"
              />
            </div>
          </div>
          {!Array.isArray(data.products) || data.products.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyMedia variant="icon">
                <PackageSearchIcon />
              </EmptyMedia>
              <EmptyHeader className="max-w-xl">
                <EmptyTitle>Hiện tại chưa có sản phẩm nào trong danh mục này</EmptyTitle>
                <EmptyDescription>
                  Hãy quay lại sau hoặc khám phá thêm nhiều sản phẩm khác tại trang chủ nhé!
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link to="/products" className={buttonVariants({ effect: 'glass' })}>
                  Xem thêm <ArrowRightIcon />
                </Link>
              </EmptyContent>
            </Empty>
          ) : (
            <CarouselContent className="flex items-stretch gap-6">
              {data.products.map((product) => (
                <CarouselItem
                  key={product?.id}
                  className={cn('sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 xxl:basis-1/6')}
                >
                  <ProductCard data={{ ...product, type: category.type!, images: product?.images }} />
                </CarouselItem>
              ))}
            </CarouselContent>
          )}
        </div>{' '}
      </Carousel>
    </Suspense>
  )
}

export default RelatedProducts
