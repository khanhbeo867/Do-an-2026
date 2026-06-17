import { object, string, type infer as Infer } from 'zod'

export const createCustomerSchema = object({
  email: string().optional(),
  phone: string().optional(),
  username: string({ message: 'Tên đăng nhập không được để trống' }).min(3, 'Tên đăng nhập phải có tối thiểu 3 ký tự'),
  password: string({ message: 'Mật khẩu không được để trống' }).min(6, 'Mật khẩu phải có tối thiểu 6 ký tự'),
})

export type TCreateCustomerSchema = typeof createCustomerSchema

export type TCreateCustomerValues = Infer<TCreateCustomerSchema>
