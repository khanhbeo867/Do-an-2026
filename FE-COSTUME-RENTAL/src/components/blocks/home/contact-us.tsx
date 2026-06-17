import type { ContactInfo } from '@/assets/data/contact-us'
import Image from '@/components/shared/image'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { useInView } from 'react-intersection-observer'

const ContactUs: React.FC<{ contactInfo: ContactInfo }> = ({ contactInfo }) => {
  const { ref, inView } = useInView({
    threshold: 0.25,
    rootMargin: '-50px',
    delay: 100,
    triggerOnce: true,
    // skip: !hyderated,
  })

  return (
    <section
      ref={ref}
      id="contact-us"
      className="before:bg-muted relative py-8 before:absolute before:inset-0 before:-z-10 before:skew-y-3 before:translate-y-10 sm:py-16 lg:py-24"
    >
      <div className="mx-auto container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center justify-center space-y-4 text-center sm:mb-16 lg:mb-24">
          <Badge variant="outline" className="text-base font-normal">
            Liên hệ
          </Badge>
          <h2
            aria-current={inView}
            className="text-2xl opacity-0 text-primary aria-current:opacity-100 transition-all font-semibold md:text-3xl lg:text-4xl aria-current:animate-in duration-700 paused aria-current:running fade-in-0 blur-in-lg slide-in-from-bottom-50 ease-out"
            style={{ fontFamily: 'initial' }}
          >
            Kết nối với chúng tôi - Hỗ trợ tận tâm cho mọi nhu cầu thuê áo dài của bạn
          </h2>
          <p
            aria-current={inView}
            className="text-muted-foreground opacity-0 text-base aria-current:opacity-100 transition-discrete animate-in paused aria-current:running duration-700 fade-in-0 blur-in-lg slide-in-from-bottom-50 ease-out sm:text-lg lg:text-xl"
          >
            Hãy liên hệ với chúng tôi nếu bạn cần tư vấn, báo giá combo hoặc hỗ trợ đặt trước theo khung giờ. Đội ngũ
            của chúng tôi sẽ phản hồi nhanh chóng để đảm bảo bạn có trải nghiệm tốt nhất với dịch vụ của chúng tôi.
          </p>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Image
            src="/ao-dai-collection.jpg"
            alt="Hình minh họa liên hệ cửa hàng"
            loading="lazy"
            className="size-full object-cover max-lg:max-h-70 rounded-lg"
          />

          <div>
            <h3
              aria-current={inView}
              className="hidden text-primary aria-current:block transition-discrete paused aria-current:running animate-in slide-in-from-left-10 fade-in-0 blur-in-lg duration-700 mb-2 text-2xl font-semibold"
              style={{ fontFamily: 'initial' }}
            >
              Chúng tôi luôn sẵn sàng phục vụ
            </h3>
            <p
              aria-current={inView}
              className="text-muted-foreground mb-8 opacity-0 text-base aria-current:opacity-100 transition-discrete paused aria-current:running animate-in fade-in-0 slide-in-from-left-10 blur-in-lg duration-700 sm:mb-10 sm:text-lg"
            >
              Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn với mọi thắc mắc và yêu cầu liên quan đến dịch vụ thuê áo
              dài của chúng tôi. Dù bạn cần tư vấn về sản phẩm, báo giá combo hay hỗ trợ đặt trước theo khung giờ, chúng
              tôi sẽ phản hồi nhanh chóng để đảm bảo bạn có trải nghiệm tốt nhất với dịch vụ của chúng tôi.
            </p>

            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {contactInfo.map((info, index) => (
                <Card className="bg-background hover:border-primary transition-colors duration-300" key={index}>
                  <CardContent className="flex flex-col items-center gap-4 text-center">
                    <Avatar className="size-9 border">
                      <AvatarFallback className="bg-transparent [&>svg]:size-5">
                        <Icon name={info.icon} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold">{info.title}</h4>
                      <div className="text-muted-foreground text-base font-medium">
                        {info.description.split('\n').map((line, idx) => (
                          <p key={idx} className="text-pretty sm:max-md:text-sm">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactUs
