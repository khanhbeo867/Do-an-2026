import { authMiddleware } from '@/middlewares/auth.middleware'
import { requestMiddleware } from '@/middlewares/request.middleware'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { omit } from 'lodash-es'
import { createCostumeSchema } from '../schemas/create-costume.schema'
import { updateCostumeSchema } from '../schemas/update-costume.schema'
import type { ICostume } from '../types'

export const getCostumesRpc = createServerFn({ method: 'GET' })
  .middleware([requestMiddleware])
  .handler(async ({ context }) => {
    return await context.request<ICostume[]>({ url: '/costumes' })
  })

export const getCostumeDetailRpc = createServerFn({ method: 'GET' })
  .middleware([requestMiddleware])
  .inputValidator(z.number())
  .handler(async ({ context, data }) => {
    return await context.request<ICostume>({ url: `/costumes/${data}`, params: { _expand: 'category' } })
  })

export const createCostumeRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(createCostumeSchema)
  .handler(async ({ context, data }) => {
    return await context.request<ICostume>({
      url: '/costumes',
      method: 'POST',
      data: omit(
        {
          ...data,
          category_id: data.category.id,
          sizes: data.sizes.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => item.value),
          unit: data.unit.value,
          images: data.images?.map((img) => img.id),
        },
        ['category']
      ),
    })
  })

export const updateCostumeRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(updateCostumeSchema)
  .handler(async ({ context, data: { id, ...update } }) => {
    return await context.request<ICostume>({
      url: `/costumes/${id}`,
      method: 'PATCH',
      data: {
        ...update,
        ...(update.category && { category_id: update.category.id }),
        ...(update.images && { images: update.images.map((image) => image.id) }),
        ...(update.sizes && { sizes: update.sizes.map((size) => size.value) }),
        ...(update.unit && { unit: update.unit.value }),
      },
    })
  })

export const deleteCostumeRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(z.number())
  .handler(async ({ context, data }) => {
    return await context.request({ url: `/costumes/${data}`, method: 'DELETE', params: { permanantly: true } })
  })
