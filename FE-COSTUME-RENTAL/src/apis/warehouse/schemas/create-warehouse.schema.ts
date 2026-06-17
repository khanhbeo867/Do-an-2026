import { ItemType } from '@/common/constants/enums'
import { z } from 'zod'

export const createWarehouseSchema = z.object({
  name: z.string({ message: 'Vui lòng nhập tên kho' }).nonempty({ message: 'Vui lòng nhập tên kho' }),
  managed_by: z.object(
    { id: z.number(), full_name: z.string().nonempty() },
    { message: 'Vui lòng chọn nhân viên quản lý kho' }
  ),
  type: z.object(
    { label: z.string().nonempty(), value: z.nativeEnum(ItemType) },
    { message: 'Vui lòng chọn loại kho' }
  ),
})

export type TCreateWarehouseSchema = typeof createWarehouseSchema

export type TCreateWarehouseValues = z.infer<TCreateWarehouseSchema>
