import { nativeEnum, number, type infer as Infer } from 'zod'
import { WorkStatus } from '../constants'
import { createEmployeeSchema } from './create-employee.schema'

export const updateEmployeeSchema = createEmployeeSchema
  .partial()
  .extend({ id: number(), work_status: nativeEnum(WorkStatus).optional() })

export type TUpdateEmployeeSchema = typeof updateEmployeeSchema

export type TUpdateEmployeeValues = Infer<TUpdateEmployeeSchema>
