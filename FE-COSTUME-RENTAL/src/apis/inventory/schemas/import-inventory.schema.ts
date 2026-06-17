import { CostumeSize } from '@/apis/costume/constants'
import { ItemType } from '@/common/constants/enums'
import { z } from 'zod'

export const importInventorySchema = z.object({
  item: z.object({ id: z.number(), name: z.string() }, { message: 'Vui lòng chọn 1 sản phẩm' }),
  item_type: z.nativeEnum(ItemType, { message: 'Hãy chọn 1 loại sản phẩm' }),
  size: z
    .object({ label: z.string(), value: z.nativeEnum(CostumeSize) }, { message: 'Hãy chọn 1 size cho trang phục' })
    .optional(),
  quantity: z.number({ message: 'Vui lòng nhập số lượng' }).min(1, { message: 'Số lượng phải lớn hơn 0' }),
  warehouse: z.object(
    {
      id: z.number().min(1),
      name: z.string(),
    },
    { message: 'Vui lòng chọn kho hàng nhận sản phẩm' }
  ),
})

export type TImportInventoryValues = z.infer<typeof importInventorySchema>
