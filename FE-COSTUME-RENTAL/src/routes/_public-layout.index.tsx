import { getCategoriesQueryOptions } from '@/apis/category/hooks/use-category-request'
import { stats } from '@/assets/data/about-us'
import { contactInfo } from '@/assets/data/contact-us'
import AboutUs from '@/components/blocks/home/about-us'
import ContactUs from '@/components/blocks/home/contact-us'
import HeroBanner from '@/components/blocks/home/hero-banner'
import { Offers } from '@/components/blocks/home/offers'
import Masonry from '@/components/blocks/home/masonry'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public-layout/')({
  head: () => ({
    meta: [
      { title: 'Diamond Studio' },
      {
        name: 'description',
        content: 'Khám phá dịch vụ cho thuê trang phục và đạo cụ chuyên nghiệp cho sự kiện, biểu diễn và chụp ảnh.',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Diamond Studio',
          url: 'https://diamond-studio-vmu.vercel.app',
          logo: 'https://diamond-studio-vmu.vercel.app/logo.svg',
          sameAs: ['https://www.facebook.com/su.studio.dance'],
        }),
      },
    ],
  }),
  component: HomePage,
  loader: async ({ context }) => {
    return await context.queryClient.ensureQueryData(getCategoriesQueryOptions())
  },
})

function HomePage() {
  return (
    <main className="space-y-16">
      <HeroBanner />
      <Masonry />
      <Offers />
      <AboutUs stats={stats} />
      <ContactUs contactInfo={contactInfo} />
    </main>
  )
}

