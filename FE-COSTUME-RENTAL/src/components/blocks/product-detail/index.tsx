import useAuth from '@/apis/auth/hooks/use-auth-request'
import { useGetProductDetailQuery } from '@/apis/product/hooks/use-product-request'
import type { IProduct } from '@/apis/product/types'
import { RENTAL_POLICIES } from '@/assets/data/rental-policies'
import { ItemType } from '@/common/constants/enums'
import { formatCurrency } from '@/common/helpers/format-intl'
import Image from '@/components/shared/image'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { useCartStore } from '@/hooks/use-cart-store'
import { cn } from '@/lib/utils'
import { useRouter } from '@tanstack/react-router'
import { CheckIcon, LightbulbIcon, ShoppingBagIcon, XIcon } from 'lucide-react'

import { rewriteImageUrl } from '@/common/helpers/image-url'
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import RelatedProducts from './related-products'


const ProductDetailPage: React.FC = () => {
  const productDetailQuery = useGetProductDetailQuery()

  const [mainApi, setMainApi] = useState<CarouselApi>()
  const [thumbApi, setThumbApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  // Size and quantity state
  const [selectedSize, setSelectedSize] = useState<string | undefined>()
  const [quantity, setQuantity] = useState<number>(1)

  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)

  const data = productDetailQuery?.data as IProduct | undefined

  const maxAvailable = useMemo(() => {
    if (!data) return 1
    if (data.category?.type === ItemType.COSTUME) {
      if (!selectedSize) return 1
      return data.inventory?.by_size?.find((s: any) => s.size === selectedSize)?.available_quantity ?? 1
    }
    return data.inventory?.available_quantity ?? 1
  }, [data, selectedSize])

  useEffect(() => {
    setQuantity(1)
  }, [selectedSize])

  useEffect(() => {
    if (!mainApi) return

    setCurrent(mainApi.selectedScrollSnap())
    mainApi.on('select', () => {
      const selectedIndex = mainApi.selectedScrollSnap()
      setCurrent(selectedIndex)
      thumbApi?.scrollTo(selectedIndex)
    })
  }, [mainApi, thumbApi])

  useEffect(() => {
    if (!thumbApi) {
      return
    }

    thumbApi.on('select', () => {
      const selectedIndex = thumbApi.selectedScrollSnap()
      setCurrent(selectedIndex)
      mainApi?.scrollTo(selectedIndex)
    })
  }, [thumbApi, mainApi])

  const handleThumbClick = useCallback(
    (index: number) => {
      mainApi?.scrollTo(index)
    },
    [mainApi]
  )

  return (
    <div className="container mx-auto space-y-10 p-3 sm:p-4 md:p-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr] lg:gap-10">
        <Suspense fallback={<FallbackDetail />}>
          {/* Product image slider */}
          <div className="space-y-3 flex flex-col items-center">
            <Carousel
              className="w-full lg:col-span-2 "
              setApi={setMainApi}
              opts={{
                loop: true,
              }}
            >
              <CarouselContent>
                {Array.isArray(productDetailQuery?.data?.images) &&
                  productDetailQuery.data.images.map((item) => (
                    <CarouselItem key={item.id} className="flex w-full items-center rounded justify-center">
                      <Image
                        src={rewriteImageUrl(item.dest)}
                        alt={item.file_name}
                        className="aspect-square h-auto w-full max-w-136 rounded-md object-cover object-top"
                      />
                    </CarouselItem>
                  ))}
              </CarouselContent>
            </Carousel>
            <Carousel
              className="relative w-full max-lg:order-2 lg:col-span-3"
              setApi={setThumbApi}
              opts={{ loop: true }}
            >
              <CarouselContent className="flex justify-center p-2">
                {Array.isArray(data?.images) &&
                  data?.images.map((item, index) => (
                    <CarouselItem
                      key={item.id}
                      className={cn(
                        'basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/3 xl:basis-1/4 flex justify-center items-stretch'
                      )}
                      onClick={() => handleThumbClick(index)}
                    >
                      <Image
                        aria-current={current === index}
                        src={rewriteImageUrl(item?.dest)}
                        alt={item.file_name}
                        className="size-18 rounded object-cover object-top outline-offset-4 aria-current:outline-2 aria-current:outline-primary sm:size-20 md:size-24"
                      />
                    </CarouselItem>
                  ))}
              </CarouselContent>
            </Carousel>
            <div className="prose prose-p:italic rounded mt-6">
              <h4 className="inline-flex items-center gap-x-2">
                <LightbulbIcon /> Mách bạn
              </h4>
              <Typography variant="blockquote">
                Trước khi đặt thuê sản phẩm, vui lòng liên hệ với chúng tôi để được tư vấn chi tiết về màu sắc và các
                đặc điểm khác của sản phẩm nhằm đảm bảo sự hài lòng của bạn. Bạn có thể đến trực tiếp cửa hàng để xem
                sản phẩm và trải nghiệm chất liệu thực tế trước khi quyết định thuê.
              </Typography>
            </div>
          </div>

          {/* Product information */}
          <div className="space-y-4">
            <Badge variant={data?.inventory?.is_available ? 'outline' : 'destructive'}>
              {data?.inventory.is_available ? (
                <CheckIcon className="size-4 stroke-success" />
              ) : (
                <XIcon className="size-4 stroke-destructive" />
              )}
              {data?.inventory.is_available ? 'Còn hàng' : 'Không có sẵn'}
            </Badge>
            <Typography as="h1" variant="h1" color="primary" className="font-serif text-3xl md:text-4xl">
              {data?.name}
            </Typography>
            <Typography variant="h4">{formatCurrency(data?.rental_price_per_day!)}</Typography>

            {data?.category?.type === ItemType.COSTUME && (
              <div className="space-y-2">
                <Typography variant="small" className="font-semibold text-muted-foreground">Chọn size:</Typography>
                <div className="flex flex-wrap items-center gap-2">
                  {data?.color && (
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        outline: `1px solid ${data.color.hex}`,
                        outlineOffset: 2,
                        borderRadius: '100%',
                        backgroundColor: data.color.hex,
                      }}
                      className="mr-2"
                    />
                  )}

                  {Array.isArray(data?.inventory?.by_size) &&
                    data.inventory.by_size.length > 0 &&
                    data.inventory.by_size.map((size) => (
                      <button
                        key={size.size}
                        type="button"
                        disabled={!size.is_available}
                        onClick={() => setSelectedSize(size.size)}
                        className={cn(
                          "px-4 py-2 text-sm font-semibold rounded border cursor-pointer transition-all",
                          !size.is_available && "bg-muted text-muted-foreground line-through cursor-not-allowed opacity-50",
                          size.is_available && selectedSize === size.size && "bg-primary text-primary-foreground border-primary shadow-sm",
                          size.is_available && selectedSize !== size.size && "bg-background text-foreground hover:bg-muted"
                        )}
                      >
                        {size.size}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Typography variant="small" className="font-semibold text-muted-foreground">Số lượng:</Typography>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  className="size-8"
                >
                  -
                </Button>
                <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(maxAvailable, prev + 1))}
                  disabled={quantity >= maxAvailable}
                  className="size-8"
                >
                  +
                </Button>
              </div>
            </div>

            <Typography variant="blockquote" className="italic text-muted-foreground">
              <span className="underline underline-offset-2">Lưu ý:</span> Màu sắc sản phẩm có thể đậm/nhạt do hiệu ứng
              ánh sáng, cài đặt độ sáng/độ tương phản của màn hình hiển thị hoặc cơ chế phân biệt màu của mắt.
            </Typography>

            <Button
              effect="glass"
              size="lg"
              className="w-full text-base sm:w-fit"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng.')
                  router.navigate({ to: '/login' })
                  return
                }

                if (data?.category?.type === ItemType.COSTUME && !selectedSize) {
                  toast.error('Vui lòng chọn size trước khi thêm vào giỏ hàng.')
                  return
                }

                if (data) {
                  addItem({
                    id: `${data.id}_${selectedSize || 'default'}`,
                    productId: String(data.id),
                    name: data.name,
                    image: data.images?.[0]?.dest || '',
                    price: data.rental_price_per_day,
                    size: selectedSize,
                    quantity: quantity,
                    type: data.category?.type === ItemType.COSTUME ? 'costume' : 'props',
                  })
                  toast.success('Đã thêm sản phẩm vào giỏ hàng!')
                }
              }}
            >
              <ShoppingBagIcon className="size-5" /> Thêm vào giỏ hàng
            </Button>

            {/* Description */}
            {data?.description && (
              <div
                className="mt-10 space-y-3 text-sm [&_table]:mb-6 [&_table:last-of-type_td]:border-x-0! [&_table:last-of-type_th]:border-x-0! [&_table:last-of-type_th]:text-table-head-foreground [&_table:last-of-type_th]:bg-table-head/20 [&_table_th]:text-left prose-h3:text-lg [&_table]:text-foreground"
                dangerouslySetInnerHTML={{ __html: data?.description }}
              />
            )}
          </div>
        </Suspense>
      </div>

      {/* Policies */}
      <div className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
        <div className="space-y-3">
          <Typography variant="h2" as="h1" className="text-lg">
            Chính sách thuê
          </Typography>
          <Typography>
            Hãy tham khảo kỹ chính sách thuê để hiểu rõ các điều khoản liên quan đến việc thuê sản phẩm. <br /> Cảm ơn
            bạn đã quan tâm và lựa chọn dịch vụ của chúng tôi!
          </Typography>
          <Accordion multiple className="flex-1 basis-2/3">
            {RENTAL_POLICIES.map((policy) => (
              <AccordionItem key={policy.id} value={policy.id}>
                <AccordionTrigger className="text-base">{policy.name}</AccordionTrigger>
                <AccordionContent>
                  {Array.isArray(policy.detail) ? (
                    <ul className="list-disc pl-6 space-y-2">
                      {policy.detail.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  ) : (
                    policy.detail
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <Image src="/rental-policies.jpg" className="grayscale-100 basis-1/3 max-w-full rounded-lg aspect-square" />
      </div>
      <Separator />
      {/* Related products */}
      <RelatedProducts category={data?.category!} />
    </div>
  )
}

const FallbackDetail: React.FC = () => {
  return (
    <>
      <div className="space-y-3">
        <Skeleton className="aspect-square w-full max-w-136 rounded" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="aspect-square w-full rounded" />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="w-1/2 h-8 rounded" />
        <Skeleton className="w-1/4 h-6 rounded" />
      </div>
    </>
  )
}

export default ProductDetailPage
