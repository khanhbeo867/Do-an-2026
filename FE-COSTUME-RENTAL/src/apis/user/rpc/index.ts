import { authMiddleware } from '@/middlewares/auth.middleware'
import { requestMiddleware } from '@/middlewares/request.middleware'
import { createServerFn } from '@tanstack/react-start'
import { omit } from 'lodash-es'
import { number } from 'zod'
import { createUserSchema } from '../schemas/create-user.schema'
import { updateUserSchema } from '../schemas/update-user.schema'

export const getUsersRpc = createServerFn({ method: 'GET' })
  .middleware([authMiddleware, requestMiddleware])
  .handler(async ({ context }) => {
    return await context.request({ url: '/users', method: 'GET', params: { _expand: 'employee' } })
  })

export const createUserRpc = createServerFn({ method: 'POST' })
  .inputValidator(createUserSchema)
  .middleware([authMiddleware, requestMiddleware])
  .handler(async ({ context, data }) => {
    return await context.request({
      url: '/users',
      method: 'POST',
      data: omit(
        {
          ...data,
          employee_id: data.employee.id,
          role: data.role.value,
        },
        ['employee']
      ),
    })
  })

export const updateUserRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(updateUserSchema)
  .handler(async ({ context, data: { id, ...update } }) => {
    return await context.request({
      url: `/users/${id}`,
      method: 'PATCH',
      data: omit(
        {
          ...update,
          ...(update.employee && { employee_id: update.employee.id }),
          ...(update.role && { role: update.role.value }),
        },
        ['employee']
      ),
    })
  })

export const deleteUserRpc = createServerFn({ method: 'POST' })
  .inputValidator(number())
  .middleware([authMiddleware, requestMiddleware])
  .handler(async ({ context, data: id }) => {
    return await context.request({ url: `/users/${id}`, method: 'DELETE' })
  })
