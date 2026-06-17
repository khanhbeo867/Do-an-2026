import { z, type infer as Infer } from 'zod'
import { createUserSchema } from './create-user.schema'

export const updateUserSchema = createUserSchema.partial().extend({
  id: z.number(),
  is_active: z.boolean().optional(),
  phone: z.string().optional(),
})

export type TUpdateUserSchema = typeof updateUserSchema

export type TUpdateUserValues = Infer<TUpdateUserSchema>
