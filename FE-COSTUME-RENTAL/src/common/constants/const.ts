import type { IconProps } from '@/components/ui/icon'
import { ItemType } from './enums'

export const STATUS_OPTIONS: Array<{
  label: string
  value: boolean
  icon: IconProps['name']
}> = [
  {
    label: 'Đang hoạt động',
    value: true,
    icon: 'CircleCheck',
  },
  {
    label: 'Tạm khóa',
    value: false,
    icon: 'CircleMinus',
  },
]

export const ITEM_TYPE_MAP: Map<ItemType, { label: string; icon: IconProps['name'] }> = new Map([
  [ItemType.COSTUME, { label: 'Trang phục', icon: 'Shirt' }],
  [ItemType.EQUIPMENT_PROPS, { label: 'Đạo cụ', icon: 'ToolCase' }],
])

export type TColorPateItem = { hex: string; code: string; intensity: number }

export const COLOR_PALETTE: Array<TColorPateItem> = [
  { hex: '#0a0a0a', code: 'BLK', intensity: 950 },
  { hex: '#171717', code: 'BLK', intensity: 900 },
  { hex: '#262626', code: 'BLK', intensity: 800 },
  { hex: '#404040', code: 'BLK', intensity: 700 },
  { hex: '#525252', code: 'BLK', intensity: 600 },
  { hex: '#737373', code: 'BLK', intensity: 500 },
  { hex: '#a3a3a3', code: 'BLK', intensity: 400 },
  { hex: '#d4d4d4', code: 'BLK', intensity: 300 },
  { hex: '#e5e5e5', code: 'BLK', intensity: 200 },
  { hex: '#f5f5f5', code: 'BLK', intensity: 100 },

  { hex: '#450a0a', code: 'RED', intensity: 950 },
  { hex: '#7f1d1d', code: 'RED', intensity: 900 },
  { hex: '#991b1b', code: 'RED', intensity: 800 },
  { hex: '#b91c1c', code: 'RED', intensity: 700 },
  { hex: '#dc2626', code: 'RED', intensity: 600 },
  { hex: '#ef4444', code: 'RED', intensity: 500 },
  { hex: '#f87171', code: 'RED', intensity: 400 },
  { hex: '#fca5a5', code: 'RED', intensity: 300 },
  { hex: '#fecaca', code: 'RED', intensity: 200 },
  { hex: '#fee2e2', code: 'RED', intensity: 100 },

  { hex: '#431407', code: 'ORG', intensity: 950 },
  { hex: '#7c2d12', code: 'ORG', intensity: 900 },
  { hex: '#9a3412', code: 'ORG', intensity: 800 },
  { hex: '#c2410c', code: 'ORG', intensity: 700 },
  { hex: '#ea580c', code: 'ORG', intensity: 600 },
  { hex: '#f97316', code: 'ORG', intensity: 500 },
  { hex: '#fb923c', code: 'ORG', intensity: 400 },
  { hex: '#fdba74', code: 'ORG', intensity: 300 },
  { hex: '#fed7aa', code: 'ORG', intensity: 200 },
  { hex: '#ffedd5', code: 'ORG', intensity: 100 },

  { hex: '#422006', code: 'YLW', intensity: 950 },
  { hex: '#713f12', code: 'YLW', intensity: 900 },
  { hex: '#854d0e', code: 'YLW', intensity: 800 },
  { hex: '#a16207', code: 'YLW', intensity: 700 },
  { hex: '#ca8a04', code: 'YLW', intensity: 600 },
  { hex: '#eab308', code: 'YLW', intensity: 500 },
  { hex: '#facc15', code: 'YLW', intensity: 400 },
  { hex: '#fde047', code: 'YLW', intensity: 300 },
  { hex: '#fef08a', code: 'YLW', intensity: 200 },
  { hex: '#fef9c3', code: 'YLW', intensity: 100 },

  { hex: '#052e16', code: 'GRN', intensity: 950 },
  { hex: '#14532d', code: 'GRN', intensity: 900 },
  { hex: '#166534', code: 'GRN', intensity: 800 },
  { hex: '#15803d', code: 'GRN', intensity: 700 },
  { hex: '#16a34a', code: 'GRN', intensity: 600 },
  { hex: '#22c55e', code: 'GRN', intensity: 500 },
  { hex: '#4ade80', code: 'GRN', intensity: 400 },
  { hex: '#86efac', code: 'GRN', intensity: 300 },
  { hex: '#bbf7d0', code: 'GRN', intensity: 200 },
  { hex: '#dcfce7', code: 'GRN', intensity: 100 },

  { hex: '#172554', code: 'BLU', intensity: 950 },
  { hex: '#1e3a8a', code: 'BLU', intensity: 900 },
  { hex: '#1e40af', code: 'BLU', intensity: 800 },
  { hex: '#1d4ed8', code: 'BLU', intensity: 700 },
  { hex: '#2563eb', code: 'BLU', intensity: 600 },
  { hex: '#3b82f6', code: 'BLU', intensity: 500 },
  { hex: '#60a5fa', code: 'BLU', intensity: 400 },
  { hex: '#93c5fd', code: 'BLU', intensity: 300 },
  { hex: '#bfdbfe', code: 'BLU', intensity: 200 },
  { hex: '#dbeafe', code: 'BLU', intensity: 100 },

  { hex: '#1e1b4b', code: 'IDG', intensity: 950 },
  { hex: '#312e81', code: 'IDG', intensity: 900 },
  { hex: '#3730a3', code: 'IDG', intensity: 800 },
  { hex: '#4338ca', code: 'IDG', intensity: 700 },
  { hex: '#4f46e5', code: 'IDG', intensity: 600 },
  { hex: '#6366f1', code: 'IDG', intensity: 500 },
  { hex: '#818cf8', code: 'IDG', intensity: 400 },
  { hex: '#a5b4fc', code: 'IDG', intensity: 300 },
  { hex: '#c7d2fe', code: 'IDG', intensity: 200 },
  { hex: '#e0e7ff', code: 'IDG', intensity: 100 },

  { hex: '#2e1065', code: 'VOL', intensity: 950 },
  { hex: '#4c1d95', code: 'VOL', intensity: 900 },
  { hex: '#5b21b6', code: 'VOL', intensity: 800 },
  { hex: '#6d28d9', code: 'VOL', intensity: 700 },
  { hex: '#7c3aed', code: 'VOL', intensity: 600 },
  { hex: '#8b5cf6', code: 'VOL', intensity: 500 },
  { hex: '#a78bfa', code: 'VOL', intensity: 400 },
  { hex: '#c4b5fd', code: 'VOL', intensity: 300 },
  { hex: '#ddd6fe', code: 'VOL', intensity: 200 },
  { hex: '#ede9fe', code: 'VOL', intensity: 100 },
]
