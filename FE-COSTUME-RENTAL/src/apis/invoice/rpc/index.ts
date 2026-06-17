import { authMiddleware } from '@/middlewares/auth.middleware'
import { requestMiddleware } from '@/middlewares/request.middleware'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type { IInvoice } from '../types'

export const getInvoicesRpc = createServerFn({ method: 'GET' })
  .middleware([authMiddleware, requestMiddleware])
  .handler(async ({ context }) => {
    return await context.request<IInvoice[]>({ url: '/invoices' })
  })

export const payInvoiceRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ context, data }) => {
    return await context.request<IInvoice>({
      url: `/invoices/${data.id}/pay`,
      method: 'POST',
    })
  })

export const customerPayInvoiceRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ context, data }) => {
    return await context.request<IInvoice>({
      url: `/invoices/${data.id}/customer-pay`,
      method: 'POST',
    })
  })
