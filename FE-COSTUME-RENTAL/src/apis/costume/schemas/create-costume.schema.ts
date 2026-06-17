import { ItemType } from '@/common/constants/enums'
import { formatCurrency } from '@/common/helpers/format-intl'
import z from 'zod'
import { CostumeGender, CostumeSize, CostumeUnit } from '../constants'

export const createCostumeSchema = z.object({
  name: z
    .string({ message: 'Tên danh mục không được để trống' })
    .nonempty({ message: 'Tên danh mục không được để trống' }),
  category: z.object({ id: z.number(), name: z.string() }, { message: 'Vui lòng chọn danh mục trang phục' }),
  color: z.object(
    { hex: z.string(), code: z.string(), intensity: z.number() },
    { message: 'Màu sắc không được để trống' }
  ),
  sizes: z
    .array(
      z.object({
        value: z.nativeEnum(CostumeSize),
        label: z.nativeEnum(CostumeSize),
        sortOrder: z.number(),
      })
    )
    .nonempty({ message: 'Vui lòng chọn ít nhất một kích cỡ' }),
  gender: z.nativeEnum(CostumeGender, { message: 'Giới tính không hợp lệ' }),
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
        { message: 'Vui lòng chọn hình ảnh cho trang phục' }
      )
    )
    .nonempty({ message: 'Vui lòng chọn hình ảnh cho trang phục' }),
  price: z
    .number({ message: 'Hãy nhập giá cho trang phục' })
    .min(500_000, { message: `Giá sản phẩm lớn hơn hoặc bằng ${formatCurrency(500_000)}` }),
  rental_price_per_day: z
    .number({ message: 'Hãy nhập giá thuê theo ngày cho trang phục' })
    .min(10_000, { message: `Giá thuê theo ngày phải lớn hơn hoặc bằng ${formatCurrency(10_000)}` }),
  description: z.string({ message: 'Mô tả không được để trống' }),
  unit: z.object({ value: z.nativeEnum(CostumeUnit, { message: 'Đơn vị không hợp lệ' }) }),
  hashtags: z.array(z.string()).nonempty(),
})

export type TCreateCostumeSchema = typeof createCostumeSchema

export type TCreateCostumeValues = z.infer<TCreateCostumeSchema>
