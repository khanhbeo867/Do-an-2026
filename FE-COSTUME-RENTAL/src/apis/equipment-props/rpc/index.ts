import { authMiddleware } from '@/middlewares/auth.middleware'
import { requestMiddleware } from '@/middlewares/request.middleware'
import { createServerFn } from '@tanstack/react-start'
import { omit } from 'lodash-es'
import { number } from 'zod'
import { updateEquipmentPropsSchema } from '../schemas/update-equipment-props.schema'
import type { IEquipmentProps } from '../types'
import { createEquipmentPropsSchema } from './../schemas/create-equipment-props.schema'

export const getEquipmentPropsRpc = createServerFn({ method: 'GET' })
  .middleware([requestMiddleware])
  .handler(async ({ context }) => {
    return await context.request<IEquipmentProps[]>({ url: '/equipment-props' })
  })

export const getPropsDetailRpc = createServerFn({ method: 'GET' })
  .middleware([requestMiddleware])
  .inputValidator(number())
  .handler(async ({ context, data }) => {
    return await context.request<IEquipmentProps>({ url: `/equipment-props/${data}` })
  })

export const createEquipmentPropsRpc = createServerFn({ method: 'POST' })
  .inputValidator(createEquipmentPropsSchema)
  .middleware([authMiddleware, requestMiddleware])
  .handler(async ({ data, context }) => {
    return await context.request<IEquipmentProps>({
      url: '/equipment-props',
      method: 'POST',
      data: omit(
        {
          ...data,
          category_id: data.category.id,
          images: data.images.map((img) => img.id),
        },
        ['category']
      ),
    })
  })

export const updateEquipmentPropsRpc = createServerFn({ method: 'POST' })
  .middleware([requestMiddleware])
  .inputValidator(updateEquipmentPropsSchema)
  .handler(async ({ context, data: { id, ...update } }) => {
    return await context.request<IEquipmentProps>({
      url: `/equipment-props/${id}`,
      method: 'PATCH',
      data: omit(
        {
          ...update,
          ...(update.category && { category_id: update.category.id }),
          ...(Array.isArray(update.images) && { images: update.images.map((img) => img.id) }),
        },
        ['category']
      ),
    })
  })

export const deleteEquipmentPropsRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(number())
  .handler(async ({ context, data: id }) => {
    return await context.request({
      url: `/equipment-props/${id}`,
      method: 'DELETE',
      params: { permanantly: true },
    })
  })
