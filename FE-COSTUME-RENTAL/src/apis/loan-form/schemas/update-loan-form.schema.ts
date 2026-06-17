import { z } from 'zod'
import { loanFormSchemaBase, loanItemSchema } from './create-loan-form.schema'

export const updateLoanFormSchema = loanFormSchemaBase
  .extend({
    id: z.number({ message: 'ID phiếu thuê/mua không hợp lệ' }),
    loan_items: z.array(loanItemSchema).optional(),
  })
  .superRefine((value, context) => {
    if (value.method.value === 'BUY') {
      if (value.deposit_amount !== 0) {
        context.addIssue({
          code: 'custom',
          message: 'Phiếu mua sản phẩm không được nhập tiền đặt cọc',
          path: ['deposit_amount'],
        })
      }
    }
  })

export type TUpdateLoanFormSchema = typeof updateLoanFormSchema
export type TUpdateLoanFormValues = z.infer<TUpdateLoanFormSchema>
