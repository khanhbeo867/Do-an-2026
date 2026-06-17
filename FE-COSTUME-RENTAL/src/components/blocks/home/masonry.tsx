import { CostumeGender } from '@/apis/costume/constants'
import { ItemType } from '@/common/constants/enums'
import Image from '@/components/shared/image'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { ArrowRightIcon } from 'lucide-react'
import type React from 'react'
import { useInView } from 'react-intersection-observer'

const Masonry: React.FC = () => {
  const { ref, inView } = useInView({
    threshold: 0.25,
    rootMargin: '-100px',
    delay: 100,
    triggerOnce: true,
  })

  return (
    <section
      ref={ref}
      className={cn(
        'xl:container xxl:p-0 px-4 mx-auto grid xl:grid-cols-3 gap-6 md:max-xl:grid-cols-2 grid-cols-1 grid-rows-2 [&_*[data-slot=card-title]]:text-white [&_*[data-slot=card-description]]:text-white',
        'sm:max-md:flex sm:max-md:flex-col [&_*[data-slot=card]]:opacity-0 sm:max-md:[&_*[data-slot=card]]:h-80 [&_*[data-slot=card]]:aria-current:opacity-100 [&_*[data-slot=card]]:transition-discrete [&_*[data-slot=card]]:aria-current:animate-in [&_*[data-slot=card]]:duration-700 [&_*[data-slot=card]]:paused [&_*[data-slot=card]]:aria-current:running [&_*[data-slot=card]]:fade-in-0 [&_*[data-slot=card]]:blur-in-lg [&_*[data-slot=card]]:slide-in-from-bottom-10 [&_*[data-slot=card]]:ease-out'
      )}
    >
      <Card aria-current={inView} className=" col-start-1 xl:row-span-full p-0 relative lg:min-h-160 min-h-100">
        <Image
          src="/ao-dai-thu-bao.jpg"
          className="w-full object-cover absolute inset-0 object-top z-0"
          loading="lazy"
        />
        <CardContent className="flex flex-col items-start gap-y-1.5 relative z-10 mt-auto py-6 bg-linear-to-t from-[#00ad9695] to-75% to-transparent rounded-none">
          <CardTitle className="text-xl font-semibold">Áo dài Nữ</CardTitle>
          <CardDescription className="mb-3">
            Áo dài là trang phục truyền thống của Việt Nam, thường được mặc trong các dịp lễ hội, sự kiện quan trọng và
            cả trong cuộc sống hàng ngày.
          </CardDescription>
          <Link
            to="/products"
            search={{ item_type: ItemType.COSTUME, 'gender:eq': CostumeGender.FEMALE }}
            className={buttonVariants({ variant: 'secondary', effect: 'glass' })}
          >
            Xem thêm <ArrowRightIcon className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </CardContent>
      </Card>
      <Card
        aria-current={inView}
        className=" xl:col-start-2 relative xl:row-span-full p-0 bg-primary/10 text-primary gap-0"
      >
        <Image
          src="/ao-dai-gia-hy.jpg"
          className="w-full absolute inset-0 z-0 object-contain object-bottom"
          loading="lazy"
        />
        <CardContent className="flex flex-col items-start gap-y-1.5 z-10 xl:bg-linear-to-b bg-linear-to-t mt-auto xl:mt-0 from-[#f4e8e3] to-50% to-transparent py-6 ">
          <CardTitle className="text-xl font-semibold">Áo dài Nam</CardTitle>
          <CardDescription className="mb-3">
            Áo dài nam thường có thiết kế đơn giản hơn so với áo dài nữ, nhưng vẫn giữ được sự trang trọng và lịch lãm.
          </CardDescription>
          <Link
            to="/products"
            search={{ item_type: ItemType.COSTUME, 'gender:eq': CostumeGender.MALE }}
            className={buttonVariants({ variant: 'secondary', effect: 'glass' })}
          >
            Xem thêm <ArrowRightIcon className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </CardContent>
      </Card>
      <Card
        aria-current={inView}
        className=" xl:col-start-3 col-span-full md:max-xl:col-span-1 relative row-span-1 p-0 bg-primary/10 text-primary gap-0"
      >
        <CardContent className="flex flex-col items-start gap-y-1.5 relative z-10 xl:bg-linear-to-b bg-linear-to-t mt-auto xl:mt-0 from-[#ef756695] to-75% to-transparent py-6 ">
          <CardTitle className="text-xl font-semibold">Phù hợp mọi dịp</CardTitle>
          <CardDescription className="mb-3">
            Sự linh hoạt này làm cho áo dài trở thành một phần quan trọng của văn hóa Việt Nam.
          </CardDescription>
          <Link to="/" className={buttonVariants({ variant: 'secondary', effect: 'glass' })}>
            Khám phá <ArrowRightIcon className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </CardContent>
        <Image
          src="/ao-dai-mien-vu.jpg"
          loading="lazy"
          className="w-full absolute inset-0 z-0 object-cover object-top"
        />
      </Card>
      <Card
        aria-current={inView}
        className=" xl:col-start-3 md:max-lg:col-start-2 md:max-lg:row-start-2 col-span-full md:max-xl:col-span-1 xl:row-start-2 row-span-1 p-0 relative"
      >
        <CardContent className="flex flex-col items-start gap-y-1.5 from-[#252d3c] to-75% to-transparent xl:bg-linear-to-b bg-linear-to-t mt-auto xl:mt-0 py-6 relative z-10 text-primary-foreground">
          <CardTitle className="text-xl font-semibold">Đạo cụ</CardTitle>
          <CardDescription className="mb-3">
            Đa dạng các loại đạo cụ, nhạc cụ truyền thống và phụ kiện chụp ảnh giúp bức hình của bạn thêm sinh động, đậm chất nghệ thuật.
          </CardDescription>
          <Link
            to="/products"
            search={{ item_type: ItemType.EQUIPMENT_PROPS }}
            className={buttonVariants({ variant: 'secondary', effect: 'glass' })}
          >
            Tìm hiểu <ArrowRightIcon className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </CardContent>
        <Image
          src="/ao-ngu-than-ty-ba.jpg"
          className="w-full z-0  absolute inset-0 object-cover object-bottom xl:object-center h-full"
          loading="lazy"
        />
      </Card>
    </section>
  )
}

export default Masonry
