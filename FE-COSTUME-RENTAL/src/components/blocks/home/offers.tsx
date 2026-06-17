import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { GiftIcon, PercentIcon, UsersIcon } from 'lucide-react'
import React from 'react'

export const Offers: React.FC = () => {
  const deals = [
    {
      id: 1,
      title: 'Đăng ký liền tay, Nhận ngay ưu đãi',
      desc: 'Giảm giá trực tiếp 10% cho tất cả khách hàng mới đăng ký tài khoản và thuê trang phục lần đầu tiên tại Diamond Studio.',
      badge: 'Mới đăng ký',
      icon: <GiftIcon className="size-6 text-primary" />,
      color: 'bg-primary/5 border-primary/20',
    },
    {
      id: 2,
      title: 'VMU Student Discount',
      desc: 'Giảm 15% tổng chi phí thuê cho học sinh, sinh viên VMU khi xuất trình thẻ sinh viên. Ưu đãi áp dụng trọn đời.',
      badge: 'Học sinh & Sinh viên',
      icon: <PercentIcon className="size-6 text-success" />,
      color: 'bg-success/5 border-success/20',
    },
    {
      id: 3,
      title: 'Thuê tập thể - Tiết kiệm cực lớn',
      desc: 'Giảm ngay 10% khi thuê từ 5 bộ trang phục trở lên, giảm 15% khi thuê từ 10 bộ trở lên. Thích hợp cho đội nhóm, câu lạc bộ.',
      badge: 'Ưu đãi nhóm',
      icon: <UsersIcon className="size-6 text-warning" />,
      color: 'bg-warning/5 border-warning/20',
    },
  ]

  return (
    <section id="xu-huong" className="container mx-auto px-4 py-8 space-y-8 scroll-mt-20">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <Typography variant="h2" as="h2" className="font-serif text-3xl font-bold text-primary">
          Chương Trình Ưu Đãi
        </Typography>
        <Typography className="text-muted-foreground text-sm sm:text-base">
          Khám phá các chương trình ưu đãi, giảm giá đặc biệt dành riêng cho khách hàng thuê trang phục truyền thống và hiện đại tại Diamond Studio.
        </Typography>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {deals.map((deal) => (
          <Card key={deal.id} className={`border ${deal.color} shadow-xs hover:shadow-md transition-shadow`}>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-background rounded-full border shadow-2xs">
                  {deal.icon}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {deal.badge}
                </Badge>
              </div>
              <div className="space-y-1">
                <Typography className="font-serif text-base font-bold text-foreground line-clamp-1">
                  {deal.title}
                </Typography>
                <Typography className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {deal.desc}
                </Typography>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
