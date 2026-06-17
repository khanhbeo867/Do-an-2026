import Footer from '@/components/layouts/public/footer'
import Header from '@/components/layouts/public/header'
import { cn } from '@/lib/utils'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_public-layout')({
  head: () => ({
    meta: [
      { title: 'Costume Rental' },
      {
        name: 'description',
        content: 'Nền tảng giới thiệu và đặt dịch vụ thuê trang phục, đạo cụ cho sự kiện và biểu diễn.',
      },
    ],
  }),
  component: PublicLayout,
})

function PublicLayout() {
  return (
    <div
      className={cn(
        'min-h-dvh flex flex-col [--header-top-height:0px] [--header-bottom-height:52px] md:[--header-top-height:52px]'
      )}
    >
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
