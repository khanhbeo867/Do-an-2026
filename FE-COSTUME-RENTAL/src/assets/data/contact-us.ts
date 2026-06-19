import type { IconProps } from '@/components/ui/icon'

export type ContactInfo = {
  slug: string
  title: string
  icon: IconProps['name']
  description: string
}[]

export const contactInfo: ContactInfo = [
  {
    slug: 'open-time',
    title: 'Giờ mở cửa',
    icon: 'Clock8',
    description: 'Thứ Hai - Chủ Nhật\n8:30 - 18:00',
  },
  {
    slug: 'address',
    title: 'Địa chỉ cửa hàng',
    icon: 'MapPin',
    description: '36 Hào Khê, Cát Bi, Hải Phòng',
  },
  {
    slug: 'email',
    title: 'Email hỗ trợ',
    icon: 'Mail',
    description: 'diamond-studio@gmail.com',
  },
  {
    slug: 'hotline',
    title: 'Hotline',
    icon: 'Phone',
    description: '0829 428 298',
  },
]
