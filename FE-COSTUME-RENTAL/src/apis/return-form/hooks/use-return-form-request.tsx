import { queryOptions, useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  completeReturnFormRpc,
  createInvoiceFromReturnRpc,
  createPenaltyFromReturnRpc,
  createReturnFormRpc,
  deleteReturnFormRpc,
  getReturnFormDetailRpc,
  getReturnFormsRpc,
  updateReturnFormRpc,
} from '../rpc'
import type { TCreateReturnFormValues } from '../schemas/create-return-form.schema'
import type { TUpdateReturnFormValues } from '../schemas/update-return-form.schema'

export const GET_RETURN_FORMS_QUERY_KEY = 'return_forms' as const

export const getReturnFormsQueryOptions = () => {
  return queryOptions({
    queryKey: [GET_RETURN_FORMS_QUERY_KEY],
    queryFn: () => getReturnFormsRpc(),
  })
}

export const getReturnFormDetailQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: [GET_RETURN_FORMS_QUERY_KEY, id],
    queryFn: () => getReturnFormDetailRpc({ data: { id } }),
  })
}

export const useGetReturnFormsQuery = () => {
  return useSuspenseQuery(getReturnFormsQueryOptions())
}

export const useCreateReturnFormMutation = () => {
  const createReturnFormFn = useServerFn(createReturnFormRpc)

  return useMutation({
    meta: { invalidates: [[GET_RETURN_FORMS_QUERY_KEY]] },
    mutationFn: (data: TCreateReturnFormValues) => createReturnFormFn({ data }),
  })
}

export const useUpdateReturnFormMutation = () => {
  const updateReturnFormFn = useServerFn(updateReturnFormRpc)

  return useMutation({
    meta: { invalidates: [[GET_RETURN_FORMS_QUERY_KEY]] },
    mutationFn: (data: TUpdateReturnFormValues) => updateReturnFormFn({ data }),
  })
}

export const useDeleteReturnFormMutation = () => {
  const deleteReturnFormFn = useServerFn(deleteReturnFormRpc)

  return useMutation({
    meta: { invalidates: [[GET_RETURN_FORMS_QUERY_KEY]] },
    mutationFn: ({ id, permanantly = true }: { id: number; permanantly?: boolean }) =>
      deleteReturnFormFn({ data: { id, permanantly } }),
  })
}

export const useCreatePenaltyFromReturnMutation = () => {
  const createPenaltyFromReturnFn = useServerFn(createPenaltyFromReturnRpc)

  return useMutation({
    meta: { invalidates: [['penalty_forms'], [GET_RETURN_FORMS_QUERY_KEY]] },
    mutationFn: (data: { loan_form_code: string; return_form_code: string; reason: string; amount: number }) =>
      createPenaltyFromReturnFn({ data }),
  })
}

export const useCreateInvoiceFromReturnMutation = () => {
  const createInvoiceFromReturnFn = useServerFn(createInvoiceFromReturnRpc)

  return useMutation({
    meta: { invalidates: [['invoices'], ['loan_forms'], [GET_RETURN_FORMS_QUERY_KEY]] },
    mutationFn: (data: {
      loan_form_code: string
      return_form_code: string
      penalty_form_code?: string | null
      payer_name: string
      payer_phone: string
      payer_citizen_id_number?: string | null
      payment_method: 'CASH' | 'BANK_TRANSFER' | 'CARD'
      payment_amount: number
      total_amount: number
      rental_amount: number
      penalty_amount: number
      refund_amount: number
      paid_at: string
      note?: string | null
    }) => createInvoiceFromReturnFn({ data }),
  })
}

export const useCompleteReturnFormMutation = () => {
  const completeReturnFormFn = useServerFn(completeReturnFormRpc)

  return useMutation({
    meta: {
      invalidates: [[GET_RETURN_FORMS_QUERY_KEY], ['loan_forms'], ['costume_inventory'], ['props_inventory']],
    },
    mutationFn: ({ id }: { id: number }) => completeReturnFormFn({ data: { id } }),
  })
}
