import { z } from 'zod'

const selectOptionSchema = z.object(
  {
    label: z.string({ message: 'Giá trị nhãn không hợp lệ' }).nonempty({ message: 'Vui lòng chọn một giá trị hợp lệ' }),
    value: z
      .string({ message: 'Giá trị lựa chọn không hợp lệ' })
      .nonempty({ message: 'Vui lòng chọn một giá trị hợp lệ' }),
  },
  { message: 'Vui lòng chọn một giá trị hợp lệ' }
)

export const updateReturnFormSchema = z.object({
  id: z.number({ message: 'ID phiếu trả không hợp lệ' }),
  loan_form: selectOptionSchema,
  returnee_name: z
    .string({ message: 'Vui lòng nhập tên người trả' })
    .nonempty({ message: 'Vui lòng nhập tên người trả' }),
  returnee_phone: z
    .string({ message: 'Vui lòng nhập số điện thoại' })
    .nonempty({ message: 'Vui lòng nhập số điện thoại' }),
  returnee_citizen_id_number: z.string({ message: 'Số CCCD không hợp lệ' }),
  skus: z.array(z.string()).optional(),
})

export type TUpdateReturnFormSchema = typeof updateReturnFormSchema
export type TUpdateReturnFormValues = z.infer<TUpdateReturnFormSchema>
