export type ReturnFormStatus = 'INSPECTED' | 'COMPLETED' | 'RETURNED' | 'CANCELED'

export interface IReturnFormItem {
  id: number
  return_form_code: string
  sku: string
  return_item_name: string
  rental_price_per_day: number
}

export interface IReturnForm {
  id: number
  code: string
  loan_form_code: string
  loan_form?: {
    code: string
    borrower_name: string
    borrower_phone?: string
    borrower_citizen_id_number?: string | null
    method?: 'BORROW' | 'RENT'
    status?: string
    total_rental_amount?: number
    deposit_amount?: number
  } | null
  returnee_name: string
  returnee_phone: string
  returnee_citizen_id_number?: string | null
  remark?: string | null
  returnee_role: string
  method: string
  status: ReturnFormStatus
  created_at?: string
  items?: IReturnFormItem[]
  created_by_employee?: {
    id?: number
    full_name?: string
    phone?: string
    employee_code?: string
  } | null
}
