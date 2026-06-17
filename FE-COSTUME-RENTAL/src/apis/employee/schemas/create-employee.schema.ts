import { PHONE_REGEX } from '@/apis/user/constants'
import { nativeEnum, object, string, type infer as Infer } from 'zod'
import { CITIZEN_ID_NUMBER_REGEX, Position } from '../constants'

export const createEmployeeSchema = object({
  full_name: string({ message: 'Vui lòng điền Họ tên nhân viên' })
    .nonempty({
      message: 'Vui lòng điền Họ tên nhân viên',
    })
    .min(6, { message: 'Họ tên tối thiểu phải có 6 ký tự' }),
  citizen_id_number: string({ message: 'Vui lòng điền số CCCD' })
    .nonempty({
      message: 'Vui lòng điền số CCCD',
    })
    .refine((value) => CITIZEN_ID_NUMBER_REGEX.test(value), {
      message: 'Số CCCD không hợp lệ',
    }),
  phone: string({ message: 'Vui lòng điền số điện thoại liên hệ' })
    .nonempty({
      message: 'Vui lòng điền số điện thoại liên hệ',
    })
    .refine((value) => PHONE_REGEX.test(value), {
      message: 'Số điện thoại không hợp lệ',
    }),
  email: string().email({ message: 'Email không hợp lệ' }).optional(),
  address: string({ message: 'Vui lòng điền chỗ ở hiện nay' }).nonempty({
    message: 'Vui lòng điền chỗ ở hiện nay',
  }),
  position: object({ label: string(), value: nativeEnum(Position, { message: 'Chọn 1 chức vụ làm việc' }) }),
})

export type TCreateEmployeeSchema = typeof createEmployeeSchema

export type TCreateEmployeeValues = Infer<TCreateEmployeeSchema>
