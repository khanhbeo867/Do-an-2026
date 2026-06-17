import { authMiddleware } from '@/middlewares/auth.middleware'
import { requestMiddleware } from '@/middlewares/request.middleware'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createLoanFormSchema } from '../schemas/create-loan-form.schema'
import { updateLoanFormSchema } from '../schemas/update-loan-form.schema'
import type { ILoanForm } from '../types'

export const getLoanFormsRpc = createServerFn({ method: 'GET' })
  .middleware([authMiddleware, requestMiddleware])
  .handler(async ({ context }) => {
    return await context.request<ILoanForm[]>({ url: '/loan-forms' })
  })

export const getLoanFormDetailRpc = createServerFn({ method: 'GET' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ context, data }) => {
    return await context.request<ILoanForm>({ url: `/loan-forms/${data.id}` })
  })

export const createLoanFormRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(createLoanFormSchema)
  .handler(async ({ context, data }) => {
    const isBorrowMethod = data.method.value === 'BORROW'

    return await context.request<ILoanForm>({
      url: '/loan-forms',
      method: 'POST',
      data: {
        borrower_name: data.borrower_name,
        borrower_phone: data.borrower_phone,
        borrower_citizen_id_number: data.borrower_citizen_id_number?.trim() || null,
        borrower_role: isBorrowMethod ? 'INTERNAL' : 'EXTERNAL',
        due_date: data.due_date,
        method: data.method.value,
        deposit_amount: isBorrowMethod ? 0 : Number(data.deposit_amount ?? 0),
        loan_items: (data.loan_items ?? []).map((loanItem) => ({
          item_type: loanItem.item_type.value,
          item_id: loanItem.item.item_id,
          sku: loanItem.item.sku,
        })),
      },
    })
  })

export const checkoutLoanFormRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ context, data }) => {
    return await context.request<ILoanForm>({
      url: `/loan-forms/${data.id}/checkout`,
      method: 'POST',
    })
  })

export const cancelLoanFormRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ context, data }) => {
    return await context.request<ILoanForm>({
      url: `/loan-forms/${data.id}/cancel`,
      method: 'POST',
    })
  })

export const confirmLoanDepositRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ context, data }) => {
    return await context.request<ILoanForm>({
      url: `/loan-forms/${data.id}/confirm-deposit`,
      method: 'POST',
    })
  })

export const startLoanShippingRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ context, data }) => {
    return await context.request<ILoanForm>({
      url: `/loan-forms/${data.id}/start-shipping`,
      method: 'POST',
    })
  })

export const completeLoanDeliveryRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ context, data }) => {
    return await context.request<ILoanForm>({
      url: `/loan-forms/${data.id}/complete-delivery`,
      method: 'POST',
    })
  })

export const addLoanItemsRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(z.object({ id: z.number(), skus: z.array(z.string()).min(1) }))
  .handler(async ({ context, data }) => {
    return await context.request<ILoanForm>({
      url: `/loan-forms/${data.id}/items`,
      method: 'POST',
      data: {
        skus: data.skus,
      },
    })
  })

export const updateLoanFormRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(updateLoanFormSchema)
  .handler(async ({ context, data: { id, ...payload } }) => {
    const isBorrowMethod = payload.method.value === 'BORROW'

    return await context.request<ILoanForm>({
      url: `/loan-forms/${id}`,
      method: 'PATCH',
      data: {
        borrower_name: payload.borrower_name,
        borrower_phone: payload.borrower_phone,
        borrower_citizen_id_number: payload.borrower_citizen_id_number?.trim() || null,
        borrower_role: isBorrowMethod ? 'INTERNAL' : 'EXTERNAL',
        due_date: payload.due_date,
        method: payload.method.value,
        deposit_amount: isBorrowMethod ? 0 : Number(payload.deposit_amount ?? 0),
      },
    })
  })

export const createCustomerOrderRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(
    z.object({
      borrower_name: z.string(),
      borrower_phone: z.string(),
      borrower_citizen_id_number: z.string().nullable().optional(),
      borrower_role: z.string(),
      due_date: z.string().nullable().optional(),
      method: z.string(),
      deposit_amount: z.number(),
      remark: z.string().nullable().optional(),
      loan_items: z.array(
        z.object({
          sku: z.string(),
        })
      ),
    })
  )
  .handler(async ({ context, data }) => {
    return await context.request<ILoanForm>({
      url: '/loan-forms',
      method: 'POST',
      data,
    })
  })

export const deleteLoanFormRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(z.object({ id: z.number(), permanently: z.boolean().optional() }))
  .handler(async ({ context, data }) => {
    return await context.request({
      url: `/loan-forms/${data.id}`,
      method: 'DELETE',
      params: { permanantly: data.permanently ?? true },
    })
  })
