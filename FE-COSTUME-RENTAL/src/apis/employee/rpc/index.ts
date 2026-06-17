import { authMiddleware } from '@/middlewares/auth.middleware'
import { requestMiddleware } from '@/middlewares/request.middleware'
import { createServerFn } from '@tanstack/react-start'
import { number } from 'zod'
import { createEmployeeSchema } from '../schemas/create-employee.schema'
import { getEmployeeNonUserSchema } from '../schemas/get-employee-non-user.schema'
import { updateEmployeeSchema } from '../schemas/update-employee.schema'
import type { IEmployee } from '../types'

export const getEmployeeRpc = createServerFn({ method: 'GET' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(getEmployeeNonUserSchema)
  .handler(async ({ context, data }) => {
    return await context.request<IEmployee[]>({ url: '/employees', ...(data && { params: data as RequestQuery }) })
  })

export const createEmployeeRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(createEmployeeSchema)
  .handler(async ({ context, data }) => {
    return await context.request({
      url: '/employees',
      method: 'POST',
      data: {
        ...data,
        position: data.position.value,
      },
    })
  })

export const updateEmployeeRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(updateEmployeeSchema)
  .handler(async ({ context, data: { id, position, ...update } }) => {
    return await context.request({
      url: `/employees/${id}`,
      method: 'PATCH',
      data: { ...update, ...(position && { position: position.value }) },
    })
  })

export const deleteEmployeeRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(number())
  .handler(async ({ context, data: id }) => {
    return await context.request({ url: `/employees/delete/${id}`, method: 'DELETE' })
  })
