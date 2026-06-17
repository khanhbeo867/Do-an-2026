import { ItemType } from '@/common/constants/enums'
import z from 'zod'

export const createCategorySchema = z.object({
  name: z
    .string({ message: 'Tên danh mục không được để trống' })
    .nonempty({ message: 'Tên danh mục không được để trống' })
    .min(6, { message: 'Tên danh mục nên có tối thiểu 6 ký tự' }),
  type: z.nativeEnum(ItemType, { message: 'Loại danh mục không hợp lệ' }),
})

export type TCreateCategorySchema = typeof createCategorySchema

export type TCreateCategoryValues = z.infer<TCreateCategorySchema>
