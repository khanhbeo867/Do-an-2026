import { object, string, type infer as Infer } from 'zod'

export const registerSchema = object({
  email: string({ message: 'Vui lòng nhập email' }).email({ message: 'Email không đúng định dạng' }).nonempty({
    message: 'Vui lòng nhập email',
  }),
  username: string({ message: 'Vui lòng nhập tài khoản' }).nonempty({
    message: 'Vui lòng nhập tài khoản',
  }),
  password: string({ message: 'Vui lòng nhập mật khẩu' }).min(6, {
    message: 'Mật khẩu phải từ 6 ký tự trở lên',
  }).nonempty({
    message: 'Vui lòng nhập mật khẩu',
  }),
  confirmPassword: string({ message: 'Vui lòng xác nhận mật khẩu' }).nonempty({
    message: 'Vui lòng xác nhận mật khẩu',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

export type TRegisterValues = Infer<typeof registerSchema>
