import z, { number } from 'zod'
import { createEquipmentPropsReqSchema, createEquipmentPropsSchema } from './create-equipment-props.schema'

export const updateEquipmentPropsSchema = createEquipmentPropsSchema.partial().extend({ id: number() })

export const updateEquipmentPropsReqSchema = createEquipmentPropsReqSchema.partial().extend({ id: number() })

export type TUpdateEquipmentPropsSchema = typeof updateEquipmentPropsSchema

export type TUpdateEquipmentPropsValues = z.infer<TUpdateEquipmentPropsSchema>

export type TUpdateEquipmentPropsReqValues = z.infer<typeof updateEquipmentPropsReqSchema>
