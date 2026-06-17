import Image from '@/components/shared/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { useState } from 'react'

import type { Stat } from '@/assets/data/about-us'
import { cn } from '@/lib/utils'
import { useInView } from 'react-intersection-observer'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible'
import { Typography } from '../../ui/typography'

const AboutUs: React.FC<{ stats: Stat[] }> = ({ stats }) => {
  const { ref, inView } = useInView({
    threshold: 0,
    // rootMargin: '-10px',
    delay: 200,
    triggerOnce: true,
  })

  const { ref: statsRef, inView: statsInView } = useInView({
    threshold: 0,
    // rootMargin: '-10px',
    delay: 200,
    triggerOnce: true,
  })

  return (
    <section
      ref={ref}
      id="about-us"
      className="before:bg-accent relative py-8 before:absolute before:inset-0 before:-z-10 before:skew-y-3 before:translate-y-10 sm:py-16 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center justify-center space-y-4 text-center md:mb-16 lg:mb-24">
          <Badge variant="outline" className="text-base font-normal">
            Về chúng tôi
          </Badge>
          <h2
            aria-current={inView}
            className="text-2xl text-primary font-semibold hidden aria-current:block transition-discrete tracking-tight md:text-3xl lg:text-4xl animate-in duration-700 paused aria-current:running fade-in-0 blur-in-lg slide-in-from-bottom-50 ease-out"
            style={{ fontFamily: 'initial' }}
          >
            Diamond Studio - Tôn Vinh Bản Sắc Việt
          </h2>
          <p
            aria-current={inView}
            className="text-muted-foreground hidden text-base aria-current:block transition-discrete animate-in paused aria-current:running duration-1000 fade-in-0 blur-in-lg slide-in-from-bottom-50 ease-out sm:text-lg lg:text-xl"
          >
            Chuyên cho thuê áo dài thiết kế và trang phục truyền thống cao cấp. Sắc sảo từng đường kim, chuẩn phom tôn
            dáng.
          </p>
          <OurStory />
        </div>
        {/* Video player and stats */}
        <div className="relative mb-8 h-full w-full sm:mb-16 lg:mb-24">
          <Image
            src="/our-story.jpg"
            alt='Hình minh họa "Về chúng tôi"'
            className="h-full w-full grayscale-75 sm:max-lg:rounded-b-none rounded-lg brightness-80 sm:max-md:mb-6 max-h-135 object-cover object-center"
            loading="lazy"
          />

          {/* Stats card overlapping the video section */}
          <div
            ref={statsRef}
            className="bg-background grid gap-8 rounded-lg border p-4 sm:max-lg:grid-cols-2 sm:max-lg:rounded-t-none sm:p-6 md:p-8 lg:absolute lg:-bottom-25 lg:left-1/2 lg:w-1/2 lg:-translate-x-1/2 lg:grid-cols-2 lg:px-10"
          >
            {stats.map((stat, index) => (
              <div
                aria-current={statsInView}
                key={index}
                className="opacity-0 aria-current:opacity-100 flex transition-all animate-in paused aria-current:running fade-in-0 duration-500 slide-in-from-bottom-4 flex-col items-center justify-start gap-2.5 text-center"
              >
                <div className="flex size-7 items-center justify-center [&>svg]:size-7">
                  <Icon name={stat.icon} />
                </div>
                <span className="text-primary text-2xl font-semibold">{stat.value}</span>
                <p className="text-muted-foreground text-sm text-pretty md:text-lg">
                  {stat.description[0]} <br /> {stat.description[1]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const OurStory: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleContent>
        <div className="overflow-auto *:prose-p:text-justify prose prose-h1:text-center max-h-80 px-2 py-6 text-justify">
          <Typography variant="h1">Diamond Studio</Typography>
          <Typography>
            Diamond Studio là một thương hiệu thời trang chuyên về cho thuê áo dài thiết kế và trang phục truyền thống
            cao cấp. Với sứ mệnh tôn vinh bản sắc văn hóa Việt Nam, chúng tôi mang đến những bộ sưu tập áo dài độc đáo,
            sắc sảo từng đường kim, chuẩn phom tôn dáng, phù hợp cho mọi dịp lễ hội, sự kiện quan trọng và cả trong cuộc
            sống hàng ngày.
          </Typography>
          <Typography>
            Chúng tôi tự hào về chất lượng sản phẩm và dịch vụ, cam kết mang đến trải nghiệm thuê áo dài tuyệt vời nhất
            cho khách hàng. Với đội ngũ thiết kế sáng tạo và tay nghề cao, Diamond Studio không chỉ là nơi để bạn tìm
            kiếm những bộ áo dài đẹp mắt mà còn là điểm đến để khám phá và tôn vinh vẻ đẹp truyền thống của Việt Nam.
          </Typography>
          <Typography>
            Hãy cùng chúng tôi trải nghiệm sự tinh tế và đẳng cấp của áo dài qua từng bộ sưu tập, và để Diamond Studio
            trở thành người bạn đồng hành đáng tin cậy trong những khoảnh khắc đặc biệt của bạn.
          </Typography>
          <Typography>
            Tại Diamond Studio, chúng tôi không chỉ cho thuê áo dài mà còn mang đến một hành trình khám phá văn hóa và
            sự tự tin trong từng bộ trang phục. Hãy để chúng tôi giúp bạn tỏa sáng và thể hiện bản sắc riêng của mình
            qua những thiết kế áo dài độc đáo và chất lượng hàng đầu.
          </Typography>
          <Typography>
            Với sự kết hợp giữa truyền thống và hiện đại, Diamond Studio cam kết mang đến những trải nghiệm thuê áo dài
            đẳng cấp, giúp bạn tỏa sáng trong mọi dịp quan trọng. Hãy để chúng tôi là người bạn đồng hành đáng tin cậy
            trên hành trình khám phá vẻ đẹp văn hóa Việt Nam qua từng bộ sưu tập áo dài tinh tế và sắc sảo.
          </Typography>
          <Typography>
            Chúng tôi tin rằng mỗi bộ áo dài không chỉ là một trang phục mà còn là một tác phẩm nghệ thuật, thể hiện sự
            tinh tế và đẳng cấp. Hãy để Diamond Studio giúp bạn tỏa sáng và thể hiện bản sắc riêng của mình qua những
            thiết kế áo dài độc đáo và chất lượng hàng đầu.
          </Typography>
          <Typography>
            Hãy cùng chúng tôi khám phá và trải nghiệm sự tinh tế của áo dài qua từng bộ sưu tập, và để Diamond Studio
            trở thành người bạn đồng hành đáng tin cậy trong những khoảnh khắc đặc biệt của bạn.
          </Typography>
          <Typography>
            Tại Diamond Studio, chúng tôi không chỉ cho thuê áo dài mà còn mang đến một hành trình khám phá văn hóa và
            sự tự tin trong từng bộ trang phục. Hãy để chúng tôi giúp bạn tỏa sáng và thể hiện bản sắc riêng của mình
            qua những thiết kế áo dài độc đáo và chất lượng hàng đầu.
          </Typography>
          <Typography>
            Với sự kết hợp giữa truyền thống và hiện đại, Diamond Studio cam kết mang đến những trải nghiệm thuê áo dài
            đẳng cấp, giúp bạn tỏa sáng trong mọi dịp quan trọng. Hãy để chúng tôi là người bạn đồng hành đáng tin cậy
            trên hành trình khám phá vẻ đẹp văn hóa Việt Nam qua từng bộ sưu tập áo dài tinh tế và sắc sảo.
          </Typography>
        </div>
      </CollapsibleContent>
      <CollapsibleTrigger
        render={
          <Button size="lg" effect="glass" className="mt-4 w-fit overflow-hidden">
            {open ? 'Thu gọn' : 'Xem thêm'}
            <Icon
              name={open ? 'ArrowUp' : 'ArrowDown'}
              className={cn(
                'transition-transform duration-200',
                open ? 'group-hover:-translate-y-0.5' : 'group-hover:translate-y-0.5'
              )}
            />
          </Button>
        }
      />
    </Collapsible>
  )
}

export default AboutUs
