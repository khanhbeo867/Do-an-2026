import { contactInfo } from '@/assets/data/contact-us'
import { RENTAL_POLICIES } from '@/assets/data/rental-policies'
import { Separator } from '@/components/ui/separator'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public-layout/policies')({
  head: () => ({
    meta: [
      { title: 'Chính sách thuê đồ' },
      {
        name: 'description',
        content: 'Các điều khoản và chính sách áp dụng khi thuê trang phục, đạo cụ tại cửa hàng.',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: 'Chính sách thuê đồ tại Diamond Studio',
          description: 'Các điều khoản và chính sách áp dụng khi thuê trang phục, đạo cụ tại cửa hàng.',
        }),
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <section className="prose container mx-auto py-6 px-2 prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground">
      <h1 className="text-center">Chính sách</h1>
      <p className="text-muted-foreground text-center">
        Chúng tôi cam kết bảo vệ quyền riêng tư của bạn và tuân thủ các quy định về bảo mật dữ liệu. Chính sách này giải
        thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng dịch vụ của
        chúng tôi.
      </p>
      <h2>Chính sách thuê đồ tại cửa hàng</h2>
      <ol>
        {RENTAL_POLICIES.map((policy) => (
          <li key={policy.id}>
            <strong>{policy.name}:</strong>
            {Array.isArray(policy.detail) ? (
              <ul>
                {policy.detail.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            ) : (
              <p>{policy.detail}</p>
            )}
          </li>
        ))}
      </ol>
      <p>
        Chúng tôi khuyến khích khách hàng đọc kỹ và hiểu rõ các chính sách này trước khi sử dụng dịch vụ của chúng tôi.
      </p>

      <Separator />

      <h2>Câu hỏi ?</h2>
      <p>
        Nếu bạn có bất kỳ câu hỏi nào về chính sách của chúng tôi hoặc cần thêm thông tin, đừng ngần ngại liên hệ với
        chúng tôi để được hỗ trợ. Chúng tôi luôn sẵn sàng giúp đỡ bạn và đảm bảo rằng bạn có trải nghiệm tốt nhất khi sử
        dụng dịch vụ của chúng tôi.
      </p>

      <ul>
        {contactInfo.map((info) => (
          <li key={info.title}>
            <strong>{info.title}:</strong> {info.description}
          </li>
        ))}
      </ul>
    </section>
  )
}
