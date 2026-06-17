import Image from '@/components/shared/image'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { ArrowRightIcon } from 'lucide-react'

const HeroBanner: React.FC = () => {
  return (
    <section className="relative text-primary-foreground w-full h-auto">
      <div className="grid place-content-center absolute inset-0 bg-radial from-black/50 to-black/75">
        <div className="flex flex-col items-center gap-3 px-4 text-center sm:px-6 lg:px-8">
          <Link
            to="/"
            className={buttonVariants({
              variant: 'link',
              size: 'sm',
              className:
                'bg-transparent mb-6 animate-in fade-in-0 slide-in-from-bottom-100 zoom-in-90 duration-500 text-white',
            })}
          >
            Khám phá bộ sưu tập
          </Link>

          <h1
            className="text-3xl font-bold text-white blur-in-lg animate-in fade-in-0 slide-in-from-bottom-50 ease-out duration-500 sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'initial' }}
          >
            Gói Trọn Nét Thơ - Tôn Vinh Bản Sắc
          </h1>
          <p className="max-w-5xl text-pretty text-sm text-white animate-in blur-in-lg fade-in-0 slide-in-from-bottom-50 ease-out duration-700 sm:text-base lg:text-lg">
            Cho thuê áo dài thiết kế và trang phục truyền thống cao cấp. Sắc sảo từng đường kim, chuẩn phom tôn dáng. Đa
            dạng mẫu mã, màu sắc, phù hợp mọi dịp. Trọn gói trải nghiệm áo dài đẳng cấp, tôn vinh vẻ đẹp Việt.
          </p>

          <div className="mt-6 flex w-full flex-col items-center justify-center gap-2 animate-in fade-in-0 slide-in-from-bottom-100 zoom-in-95 duration-500 sm:w-auto sm:flex-row">
            <Link
              to="/products"
              className={buttonVariants({ size: 'lg', effect: 'glass', className: 'w-full sm:w-auto' })}
            >
              Cửa hàng
            </Link>
            <Link
              to="/"
              hash=""
              className={buttonVariants({
                variant: 'outline',
                className: 'w-full bg-transparent text-white sm:w-auto',
              })}
            >
              Khám phá <ArrowRightIcon className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      <Image
        src="/hero-banner.jpg"
        loading="lazy"
        className="-z-10 h-[70vh] min-h-105 w-full object-cover sm:h-150 xxl:h-[90vh]"
      />
    </section>
  )
}

export default HeroBanner
