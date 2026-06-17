import { COSTUME_GENDER_LABEL_MAP } from '@/apis/costume/constants'
import type { IProduct } from '@/apis/product/types'
import { GENDER_ICONS } from '@/assets/svg/gender-icons'
import { ItemType } from '@/common/constants/enums'
import { formatCurrency } from '@/common/helpers/format-intl'
import { rewriteImageUrl } from '@/common/helpers/image-url'
import Image from '@/components/shared/image'
import { Badge } from '@/components/ui/badge'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { Link } from '@tanstack/react-router'
import Autoplay from 'embla-carousel-autoplay'
import Fade from 'embla-carousel-fade'
import { isNil } from 'lodash-es'
import { useRef } from 'react'

const ProductCard: React.FC<{
  data: Pick<IProduct, 'id' | 'name' | 'images' | 'type' | 'rental_price_per_day' | 'color' | 'gender' | 'sizes'>
}> = ({ data }) => {
  const gender = !isNil(data.gender)
    ? { icon: GENDER_ICONS.get(data.gender)!, label: COSTUME_GENDER_LABEL_MAP.get(data.gender)! }
    : null

  const autoplay = useRef(
    Autoplay({
      delay: 1000,
      stopOnInteraction: false,
      playOnInit: false,
    })
  )
  const hasImages = Array.isArray(data.images) && data.images.length > 0
  const hasMultipleImages = Array.isArray(data.images) && data.images.length > 1

  return (
    <Link
      className="block h-full space-y-3"
      to="/products/$type/$productId"
      params={{
        type: data.type?.toLowerCase?.().replaceAll('_', '-') as 'costume' | 'equipment-props',
        productId: data?.id,
      }}
    >
      {hasImages ? (
        <Carousel
          className="overflow-hidden rounded"
          opts={{ loop: hasMultipleImages }}
          plugins={[Fade({ active: true }), ...(hasMultipleImages ? [autoplay.current] : [])]}
          onPointerEnter={() => {
            if (hasMultipleImages) {
              autoplay.current.play()
            }
          }}
          onPointerLeave={() => {
            autoplay.current.stop()
          }}
        >
          <CarouselContent className="ml-0">
            {data.images?.map((image) => (
              <CarouselItem key={image.id} className="pl-0">
                <Image
                  src={rewriteImageUrl(image.dest)}
                  title={data.name}
                  className="aspect-square w-full object-cover object-top"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        <div className="aspect-square w-full rounded bg-muted" />
      )}
      <div className="grid auto-cols-auto gap-1">
        <Typography variant="small" color="muted" className="line-clamp-2 text-xs sm:text-sm">
          {data.name}
        </Typography>
        <Typography as="span" className="font-medium">
          {formatCurrency(data?.rental_price_per_day ?? 0)}
        </Typography>
        {data.type === ItemType.COSTUME && gender && (
          <Badge variant="outline" className="col-start-2 row-start-1 place-self-end">
            <gender.icon />
            {gender.label}
          </Badge>
        )}
      </div>
      {data.type === ItemType.COSTUME && (
        <div className="flex gap-2 flex-wrap items-center">
          <div
            style={{
              width: 12,
              height: 12,
              outline: `1px solid ${data.color?.hex}`,
              outlineOffset: 2,
              borderRadius: '100%',
              backgroundColor: data.color?.hex,
            }}
          />
          <Separator orientation="vertical" />
          {Array.isArray(data.sizes) && (
            <div className="flex gap-1 flex-wrap">
              {data.sizes.map((size) => (
                <Badge key={size} variant="outline">
                  {size}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </Link>
  )
}

export default ProductCard
