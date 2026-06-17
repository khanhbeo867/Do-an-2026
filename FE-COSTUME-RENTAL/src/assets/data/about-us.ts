import type { IconProps } from '@/components/ui/icon'

export type Stat = {
  icon: IconProps['name']
  value: string
  description: string[]
}

export const stats: Stat[] = [
  {
    icon: 'Sparkles',
    value: '10+',
    description: ['Năm phục vụ', 'với sự tận tâm và chất lượng'],
  },
  {
    icon: 'Star',
    value: '35+',
    description: ['Bộ sưu tập', 'áo dài thiết kế độc đáo và trang phục truyền thống đa dạng'],
  },
]

