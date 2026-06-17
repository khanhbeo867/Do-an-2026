import z from 'zod'
import { WorkStatus } from '../constants'

export const getEmployeeNonUserSchema = z
  .object({
    'position:in': z.string(),
    'is_active:eq': z.boolean(),
    'work_status:ne': z.enum([WorkStatus.EXITED]),
    'user_id:eq': z.number().or(z.null()),
  })
  .partial()
  .nullish()

export type TGetEmployeeNonUserParams = z.infer<typeof getEmployeeNonUserSchema>
