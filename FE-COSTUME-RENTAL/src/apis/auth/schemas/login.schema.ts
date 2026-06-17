import { object, string, type infer as Infer } from 'zod'

export const loginSchema = object({
  username: string({ message: 'Vui lòng nhập email/tài khoản' }).nonempty({
    message: 'Vui lòng nhập email/tài khoản',
  }),
  password: string({ message: 'Vui lòng nhập mật khẩu' }).nonempty({
    message: 'Vui lòng nhập mật khẩu',
  }),
})

export type TLoginValues = Infer<typeof loginSchema>
