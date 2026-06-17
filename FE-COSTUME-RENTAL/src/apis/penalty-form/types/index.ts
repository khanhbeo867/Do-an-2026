export type PenaltyFormStatus = 'ISSUED' | 'PAID' | 'CANCELED'

export interface IPenaltyForm {
  id: number
  code: string
  loan_form_code?: string | null
  loan_form?: {
    code: string
    borrower_name: string
  } | null
  return_form_code?: string | null
  return_form?: {
    code: string
    returnee_name: string
    loan_form?: {
      code: string
      borrower_name: string
    } | null
  } | null
  reason: string
  amount: number
  status: PenaltyFormStatus
  created_at?: string
  created_by_employee?: {
    id?: number
    full_name?: string
    phone?: string
    employee_code?: string
  } | null
}
