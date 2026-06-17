import { ItemType } from '@/common/constants/enums'
import { formatCurrency } from '@/common/helpers/format-intl'
import z from 'zod'

export const createEquipmentPropsSchema = z.object({
  name: z
    .string({ message: 'Tên danh mục không được để trống' })
    .nonempty({ message: 'Tên danh mục không được để trống' }),
  category: z.object({ id: z.number(), name: z.string() }, { message: 'Vui lòng chọn danh mục đạo cụ' }),
  images: z
    .array(
      z.object(
        {
          id: z.number().int(),
          file_name: z.string(),
          dest: z.string(),
          size: z.number(),
          mime_type: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
          category_id: z.number().int().optional(),
          category: z
            .object({
              id: z.number(),
              name: z.string(),
              slug: z.string(),
              type: z.nativeEnum(ItemType),
            })
            .optional(),
        },
        { message: 'Vui lòng chọn hình ảnh cho đạo cụ' }
      )
    )
    .nonempty({ message: 'Vui lòng chọn hình ảnh cho đạo cụ' }),
  price: z
    .number({ message: 'Hãy nhập giá cho đạo cụ' })
    .min(50_000, { message: `Giá sản phẩm lớn hơn hoặc bằng ${formatCurrency(50_000)}` }),
  rental_price_per_day: z
    .number({ message: 'Hãy nhập giá thuê theo ngày cho đạo cụ' })
    .min(10_000, { message: `Giá thuê theo ngày phải lớn hơn hoặc bằng ${formatCurrency(10_000)}` }),
  description: z.string({ message: 'Mô tả không được để trống' }),
  unit: z.string(),
  hashtags: z.array(z.string()).nonempty(),
})

export const createEquipmentPropsReqSchema = createEquipmentPropsSchema
  .omit({ images: true })
  .extend({ images: z.array(z.number()), category_id: z.number() })

export type TCreateEquipmentPropsSchema = typeof createEquipmentPropsSchema

export type TCreateEquipmentPropsValues = z.infer<TCreateEquipmentPropsSchema>

export type TCreateEquipmentPropsReqValues = z.infer<typeof createEquipmentPropsReqSchema>
