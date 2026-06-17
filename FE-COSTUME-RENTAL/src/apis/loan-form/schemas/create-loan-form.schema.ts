import { z } from 'zod'

const isTomorrowOrLater = (value: string) => {
  const dueDate = new Date(value)
  const minDate = new Date()
  minDate.setHours(0, 0, 0, 0)
  minDate.setDate(minDate.getDate() + 1)

  return dueDate.getTime() >= minDate.getTime()
}

const selectOptionSchema = z.object(
  {
    label: z.string({ message: 'Giá trị nhãn không hợp lệ' }).nonempty({ message: 'Vui lòng chọn một giá trị hợp lệ' }),
    value: z
      .string({ message: 'Giá trị lựa chọn không hợp lệ' })
      .nonempty({ message: 'Vui lòng chọn một giá trị hợp lệ' }),
  },
  { message: 'Vui lòng chọn một giá trị hợp lệ' }
)

const employeeOptionSchema = z.object({
  id: z.number({ message: 'Nhân viên không hợp lệ' }).optional(),
  full_name: z.string().optional(),
  phone: z.string().optional(),
  citizen_id_number: z.string().optional(),
})

const loanItemTypeOptionSchema = z.object(
  {
    label: z.string({ message: 'Loại sản phẩm không hợp lệ' }).nonempty({ message: 'Vui lòng chọn loại sản phẩm' }),
    value: z.enum(['COSTUME', 'EQUIPMENT_PROPS'], {
      message: 'Loại sản phẩm không hợp lệ',
    }),
  },
  { message: 'Vui lòng chọn loại sản phẩm' }
)

const loanItemOptionSchema = z.object(
  {
    sku: z.string({ message: 'SKU không hợp lệ' }).nonempty({ message: 'Vui lòng chọn SKU' }),
    item_id: z.number({ message: 'Sản phẩm không hợp lệ' }).min(1, { message: 'Vui lòng chọn sản phẩm hợp lệ' }),
    item_type: z.enum(['COSTUME', 'EQUIPMENT_PROPS'], {
      message: 'Loại sản phẩm không hợp lệ',
    }),
    name: z.string().optional(),
    rental_price_per_day: z.number().optional(),
  },
  { message: 'Vui lòng chọn SKU hợp lệ' }
)

export const loanItemSchema = z.object({
  item_type: loanItemTypeOptionSchema,
  item: loanItemOptionSchema,
})

export const loanFormSchemaBase = z.object({
  borrower_name: z
    .string({ message: 'Vui lòng nhập tên người thuê/mua' })
    .nonempty({ message: 'Vui lòng nhập tên người thuê/mua' }),
  borrower_phone: z
    .string({ message: 'Vui lòng nhập số điện thoại' })
    .nonempty({ message: 'Vui lòng nhập số điện thoại' }),
  borrower_citizen_id_number: z
    .string({ message: 'Số CCCD không hợp lệ' })
    .optional()
    .or(z.null())
    .or(z.literal('')),
  borrower_role: selectOptionSchema,
  method: selectOptionSchema,
  due_date: z
    .string({ message: 'Vui lòng chọn ngày hẹn trả' })
    .optional()
    .or(z.null())
    .or(z.literal('')),
  employee: employeeOptionSchema,
  deposit_amount: z
    .number({ message: 'Tiền đặt cọc phải là số hợp lệ' })
    .min(0, { message: 'Tiền đặt cọc không được nhỏ hơn 0' }),
  loan_items: z.array(loanItemSchema, {
    message: 'Danh sách sản phẩm không hợp lệ',
  }),
})

export const createLoanFormSchema = loanFormSchemaBase.superRefine((value, context) => {
  const isBuyMethod = value.method.value === 'BUY'

  if (isBuyMethod) {
    if (value.deposit_amount !== 0) {
      context.addIssue({
        code: 'custom',
        message: 'Phiếu mua sản phẩm không được nhập tiền đặt cọc',
        path: ['deposit_amount'],
      })
    }
  } else {
    if (!value.due_date) {
      context.addIssue({
        code: 'custom',
        message: 'Vui lòng chọn ngày hẹn trả',
        path: ['due_date'],
      })
    } else if (!isTomorrowOrLater(value.due_date)) {
      context.addIssue({
        code: 'custom',
        message: 'Ngày hẹn trả phải từ ngày mai trở đi',
        path: ['due_date'],
      })
    }
  }

  if (!value.loan_items.length) {
    context.addIssue({
      code: 'custom',
      message: 'Vui lòng thêm ít nhất 1 sản phẩm',
      path: ['loan_items'],
    })
  }

  const duplicateSkus = value.loan_items
    .map((loanItem) => loanItem.item.sku)
    .filter((sku, index, array) => array.indexOf(sku) !== index)

  if (duplicateSkus.length) {
    context.addIssue({
      code: 'custom',
      message: `SKU bị trùng: ${Array.from(new Set(duplicateSkus)).join(', ')}`,
      path: ['loan_items'],
    })
  }

  value.loan_items.forEach((loanItem, index) => {
    if (loanItem.item.item_type !== loanItem.item_type.value) {
      context.addIssue({
        code: 'custom',
        message: 'SKU đã chọn không đúng với loại sản phẩm',
        path: ['loan_items', index, 'item'],
      })
    }
  })
})

export type TCreateLoanFormSchema = typeof createLoanFormSchema
export type TCreateLoanFormValues = z.infer<TCreateLoanFormSchema>
