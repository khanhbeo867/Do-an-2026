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

const incidentStatusSchema = z.enum(['NONE', 'DAMAGED', 'LOST'])

const incidentSchema = z.object({
  sku: z.string({ message: 'SKU không hợp lệ' }).nonempty({ message: 'SKU không được để trống' }),
  item_name: z.string(),
  item_price: z.number({ message: 'Giá trị sản phẩm không hợp lệ' }).min(0),
  incident_status: incidentStatusSchema,
  note: z.string(),
})

export const createReturnFormSchema = z
  .object({
    loan_form: selectOptionSchema,
    returnee_name: z
      .string({ message: 'Vui lòng nhập tên người trả' })
      .nonempty({ message: 'Vui lòng nhập tên người trả' }),
    returnee_phone: z
      .string({ message: 'Vui lòng nhập số điện thoại' })
      .nonempty({ message: 'Vui lòng nhập số điện thoại' }),
    returnee_citizen_id_number: z.string({ message: 'Số CCCD không hợp lệ' }),
    remark: z.string(),
    incidents: z.array(incidentSchema, {
      message: 'Danh sách sản phẩm trả không hợp lệ',
    }),
    penalty_amount: z.number({ message: 'Tiền phạt phải là số hợp lệ' }).min(0),
    penalty_note: z.string(),
    payment_method: z.enum(['CASH', 'BANK_TRANSFER', 'CARD'], {
      message: 'Vui lòng chọn phương thức thanh toán',
    }),
    payment_amount: z.number({ message: 'Số tiền thanh toán phải là số hợp lệ' }).min(0),
  })
  .superRefine((value, context) => {
    if (!value.incidents.length) {
      context.addIssue({
        code: 'custom',
        message: 'Phiếu trả phải có ít nhất 1 sản phẩm',
        path: ['incidents'],
      })
      return
    }

    const problematicItems = value.incidents.filter((incident) => incident.incident_status !== 'NONE')

    if (!problematicItems.length) {
      return
    }

    const minimumPenalty = problematicItems.reduce((total, incident) => {
      if (incident.incident_status === 'LOST') {
        return total + Number(incident.item_price ?? 0)
      }

      return total + Number(incident.item_price ?? 0) * 0.1
    }, 0)

    if (Number(value.penalty_amount ?? 0) < minimumPenalty) {
      context.addIssue({
        code: 'custom',
        message: `Tiền phạt tối thiểu là ${Math.ceil(minimumPenalty).toLocaleString('vi-VN')} VND`,
        path: ['penalty_amount'],
      })
    }

    if (!String(value.penalty_note ?? '').trim()) {
      context.addIssue({
        code: 'custom',
        message: 'Vui lòng nhập ghi chú khi có sản phẩm hỏng hoặc mất',
        path: ['penalty_note'],
      })
    }
  })

export type TCreateReturnFormSchema = typeof createReturnFormSchema
export type TCreateReturnFormValues = z.infer<TCreateReturnFormSchema>
