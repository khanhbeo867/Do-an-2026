import { authMiddleware } from '@/middlewares/auth.middleware'
import { requestMiddleware } from '@/middlewares/request.middleware'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createReturnFormSchema } from '../schemas/create-return-form.schema'
import { updateReturnFormSchema } from '../schemas/update-return-form.schema'
import type { IReturnForm } from '../types'

type PenaltyFormLike = {
  id: number
  code: string
  amount: number
}

type InvoiceLike = {
  id: number
  code: string
  total_amount: number
}

export const getReturnFormsRpc = createServerFn({ method: 'GET' })
  .middleware([authMiddleware, requestMiddleware])
  .handler(async ({ context }) => {
    return await context.request<IReturnForm[]>({ url: '/return-forms' })
  })

export const getReturnFormDetailRpc = createServerFn({ method: 'GET' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ context, data }) => {
    return await context.request<IReturnForm>({ url: `/return-forms/${data.id}` })
  })

export const createReturnFormRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(createReturnFormSchema)
  .handler(async ({ context, data }) => {
    return await context.request<IReturnForm>({
      url: '/return-forms',
      method: 'POST',
      data: {
        loan_form_code: data.loan_form.value,
        returnee_name: data.returnee_name,
        returnee_phone: data.returnee_phone,
        returnee_citizen_id_number: data.returnee_citizen_id_number?.trim() || null,
        remark: data.remark?.trim() || null,
        skus: (data.incidents ?? []).map((incident) => incident.sku),
        status: 'INSPECTED',
      },
    })
  })

export const createPenaltyFromReturnRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(
    z.object({
      loan_form_code: z.string().nonempty(),
      return_form_code: z.string().nonempty(),
      reason: z.string().nonempty(),
      amount: z.number().min(0),
    })
  )
  .handler(async ({ context, data }) => {
    return await context.request<PenaltyFormLike>({
      url: '/penalty-forms',
      method: 'POST',
      data: {
        loan_form_code: data.loan_form_code,
        return_form_code: data.return_form_code,
        reason: data.reason,
        amount: data.amount,
        status: 'ISSUED',
      },
    })
  })

export const createInvoiceFromReturnRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(
    z.object({
      loan_form_code: z.string().nonempty(),
      return_form_code: z.string().nonempty(),
      penalty_form_code: z.string().optional().nullable(),
      payer_name: z.string().nonempty(),
      payer_phone: z.string().nonempty(),
      payer_citizen_id_number: z.string().optional().nullable(),
      payment_method: z.enum(['CASH', 'BANK_TRANSFER', 'CARD']),
      payment_amount: z.number().min(0),
      total_amount: z.number().min(0),
      rental_amount: z.number().min(0),
      penalty_amount: z.number().min(0),
      refund_amount: z.number(),
      paid_at: z.string().nonempty(),
      note: z.string().optional().nullable(),
    })
  )
  .handler(async ({ context, data }) => {
    return await context.request<InvoiceLike>({
      url: '/invoices',
      method: 'POST',
      data: {
        loan_form_code: data.loan_form_code,
        return_form_code: data.return_form_code,
        penalty_form_code: data.penalty_form_code ?? null,
        payer_name: data.payer_name,
        payer_phone: data.payer_phone,
        payer_citizen_id_number: data.payer_citizen_id_number ?? null,
        payment_method: data.payment_method,
        payment_amount: data.payment_amount,
        total_amount: data.total_amount,
        rental_amount: data.rental_amount,
        penalty_amount: data.penalty_amount,
        refund_amount: data.refund_amount,
        paid_at: data.paid_at,
        note: data.note ?? null,
        status: 'PAID',
      },
    })
  })

export const completeReturnFormRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ context, data }) => {
    return await context.request<IReturnForm>({
      url: `/return-forms/${data.id}/complete`,
      method: 'POST',
    })
  })

export const deleteReturnFormRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(z.object({ id: z.number(), permanantly: z.boolean().default(true) }))
  .handler(async ({ context, data }) => {
    return await context.request<{ message: string }>({
      url: `/return-forms/${data.id}`,
      method: 'DELETE',
      params: { permanantly: data.permanantly },
    })
  })

export const updateReturnFormRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(updateReturnFormSchema)
  .handler(async ({ context, data: { id, ...payload } }) => {
    return await context.request<IReturnForm>({
      url: `/return-forms/${id}`,
      method: 'PATCH',
      data: {
        loan_form_code: payload.loan_form.value,
        returnee_name: payload.returnee_name,
        returnee_phone: payload.returnee_phone,
        returnee_citizen_id_number: payload.returnee_citizen_id_number?.trim() || null,
      },
    })
  })
