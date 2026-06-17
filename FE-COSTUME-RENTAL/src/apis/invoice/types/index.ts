export type InvoiceStatus = 'ISSUED' | 'UNCONFIRMED' | 'PAID' | 'CANCELED'
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER'

export interface IInvoice {
  id: number
  code: string
  loan_form_code?: string | null
  return_form_code?: string | null
  penalty_form_code?: string | null
  total_amount: number
  payment_amount: number
  rental_amount?: number
  penalty_amount?: number
  refund_amount?: number
  payment_method: PaymentMethod
  payer_name: string
  payer_phone: string
  payer_citizen_id_number: string
  paid_at: string
  note?: string | null
  status: InvoiceStatus
  created_at?: string | null
}
