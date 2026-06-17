import { authMiddleware } from '@/middlewares/auth.middleware'
import { requestMiddleware } from '@/middlewares/request.middleware'
import { createServerFn } from '@tanstack/react-start'
import { isNil, omitBy } from 'lodash-es'
import { z } from 'zod'
import { createWarehouseSchema } from '../schemas/create-warehouse.schema'
import { updateWarehouseSchema } from '../schemas/update-warehouse.schema'
import type { IWarehouse } from '../types'

export const getWarehousesRpc = createServerFn({ method: 'GET' })
  .middleware([authMiddleware, requestMiddleware])
  .handler(async ({ context }) => {
    return await context.request<IWarehouse[]>({ url: '/warehouses' })
  })

export const createWarehouseRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(createWarehouseSchema)
  .handler(async ({ context, data }) => {
    return await context.request({
      url: '/warehouses',
      method: 'POST',
      data: {
        name: data.name,
        type: data.type.value,
        managed_by: data.managed_by.id,
      },
    })
  })

export const updateWarehouseRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(updateWarehouseSchema)
  .handler(async ({ context, data: { id, ...update } }) => {
    return await context.request({
      url: `/warehouses/${id}`,
      method: 'PATCH',
      data: omitBy(
        {
          name: update?.name,
          type: update?.type?.value,
          managed_by: update?.managed_by?.id,
          is_active: update?.is_active,
        },
        isNil
      ),
    })
  })

export const deleteWarehouseRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(z.object({ id: z.number(), permanantly: z.boolean() }))
  .handler(async ({ context, data: { id, permanantly } }) => {
    return await context.request({
      url: `/warehouses/${id}`,
      method: 'DELETE',
      params: { permanantly },
    })
  })
