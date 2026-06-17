import { requestMiddleware } from '@/middlewares/request.middleware'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createCategorySchema } from '../schemas/create-category.schema'
import { deleteCategorySchema } from '../schemas/delete-category.schema'
import { getCategoryQuerySchema } from '../schemas/get-category-type.schema'
import { updateCategorySchema } from '../schemas/update-category.schema'
import type { ICategory } from '../types'

export const getCategoriesRpc = createServerFn({ method: 'GET' })
  .middleware([requestMiddleware])
  .inputValidator(getCategoryQuerySchema)
  .handler(async ({ context, data }) => {
    return await context.request<ICategory[]>({ url: '/categories', params: data })
  })

export const getOneCategoryRpc = createServerFn({ method: 'GET' })
  .middleware([requestMiddleware])
  .inputValidator(z.object({ id: z.number(), _embed: z.enum(['costumes', 'equipment_props']).optional() }))
  .handler(async ({ context, data: { id, _embed } }) => {
    return await context.request<ICategory>({ url: `/categories/${id}`, ...(_embed && { params: { _embed } }) })
  })

export const createCategoryRpc = createServerFn({ method: 'POST' })
  .middleware([requestMiddleware])
  .inputValidator(createCategorySchema)
  .handler(async ({ context, data }) => {
    return await context.request<ICategory>({ url: '/categories', method: 'POST', data })
  })

export const updateCategoryRpc = createServerFn({ method: 'POST' })
  .middleware([requestMiddleware])
  .inputValidator(updateCategorySchema)
  .handler(async ({ context, data: { id, ...update } }) => {
    return await context.request<ICategory>({
      url: `/categories/${id}`,
      method: 'PATCH',
      data: update,
    })
  })

export const deleteCategoryRpc = createServerFn({ method: 'POST' })
  .middleware([requestMiddleware])
  .inputValidator(deleteCategorySchema)
  .handler(async ({ context, data: { id, permanantly } }) => {
    return await context.request<any, void>({ url: `/categories/${id}`, method: 'DELETE', params: { permanantly } })
  })
