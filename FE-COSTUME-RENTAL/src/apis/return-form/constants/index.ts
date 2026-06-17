import type { ReturnFormStatus } from '../types'

export const RETURN_FORM_STATUS_LABELS: Record<ReturnFormStatus, string> = {
  INSPECTED: 'Đã kiểm tra',
  COMPLETED: 'Đã hoàn thành',
  RETURNED: 'Đã trả',
  CANCELED: 'Đã hủy',
}
