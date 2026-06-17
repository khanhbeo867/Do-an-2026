export type LoanFormStatus = 'DEPOSIT_PENDING' | 'APPROVED' | 'SHIPPING' | 'DELIVERED' | 'BORROWING' | 'RETURNED' | 'CANCELED' | 'PAID'

export type LoanMethod = 'BUY' | 'RENT'

export interface ILoanFormItem {
  id: number
  loan_form_code: string
  sku: string
  loan_item_name: string
  rental_price_per_day: number
  item_price?: number
  is_returned: boolean
}

export interface ILoanForm {
  id: number
  code: string
  borrower_name: string
  borrower_phone: string
  borrower_citizen_id_number?: string | null
  borrower_role: string
  method: LoanMethod
  due_date?: string | null
  rental_days?: number
  total_rental_amount?: number
  total_item_price_amount?: number
  deposit_amount: number
  status: LoanFormStatus
  created_at?: string
  items?: ILoanFormItem[]
  created_by_employee?: {
    id?: number
    full_name?: string
    phone?: string
    employee_code?: string
  } | null
  updated_by_employee?: {
    id?: number
    full_name?: string
    phone?: string
    employee_code?: string
  } | null
}
