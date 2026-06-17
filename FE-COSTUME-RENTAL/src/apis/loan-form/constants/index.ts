import type { IconProps } from '@/components/ui/icon'
import type { LoanFormStatus } from '../types'

export enum BorrowerRole {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

export enum LoanFormMethod {
  BUY = 'BUY',
  RENT = 'RENT',
}

export const LOAN_FORM_STATUS_LABEL: Map<LoanFormStatus, { text: string; icon: IconProps['name'] }> = new Map([
  ['DEPOSIT_PENDING', { text: 'Chờ thanh toán cọc', icon: 'Loader' }],
  ['APPROVED', { text: 'Đã xử lý', icon: 'Check' }],
  ['SHIPPING', { text: 'Đang giao hàng', icon: 'Truck' }],
  ['DELIVERED', { text: 'Đã giao hàng', icon: 'Package' }],
  ['BORROWING', { text: 'Đang thuê', icon: 'Clock' }],
  ['RETURNED', { text: 'Đã trả', icon: 'Check' }],
  ['CANCELED', { text: 'Đã hủy', icon: 'X' }],
  ['PAID', { text: 'Đã thanh toán', icon: 'Check' }],
])

export const LOAN_FORM_METHOD_LABEL: Record<LoanFormMethod, string> = {
  [LoanFormMethod.BUY]: 'Mua',
  [LoanFormMethod.RENT]: 'Thuê',
}
