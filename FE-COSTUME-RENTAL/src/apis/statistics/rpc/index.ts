import { authMiddleware } from '@/middlewares/auth.middleware'
import { requestMiddleware } from '@/middlewares/request.middleware'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type { IStatisticsQueryParams, IStatisticsResponse } from '../types'

const getStatisticsSchema = z
  .object({
    range: z.enum(['today', '7d', '30d', 'month']).optional(),
    method: z.enum(['ALL', 'BORROW', 'RENT']).optional(),
  })
  .optional()

export const getStatisticsRpc = createServerFn({ method: 'GET' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(getStatisticsSchema)
  .handler(async ({ context, data }) => {
    const params: IStatisticsQueryParams = {
      range: data?.range ?? '7d',
      method: data?.method ?? 'ALL',
    }

    return await context.request<IStatisticsResponse>({
      url: '/statistics',
      params,
    })
  })
