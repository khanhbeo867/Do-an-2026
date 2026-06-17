import { queryOptions, useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  addLoanItemsRpc,
  cancelLoanFormRpc,
  checkoutLoanFormRpc,
  confirmLoanDepositRpc,
  createCustomerOrderRpc,
  createLoanFormRpc,
  getLoanFormDetailRpc,
  getLoanFormsRpc,
  updateLoanFormRpc,
  deleteLoanFormRpc,
  startLoanShippingRpc,
  completeLoanDeliveryRpc,
} from '../rpc'
import type { TCreateLoanFormValues } from '../schemas/create-loan-form.schema'
import type { TUpdateLoanFormValues } from '../schemas/update-loan-form.schema'

export const GET_LOAN_FORMS_QUERY_KEY = 'loan_forms' as const

export const getLoanFormsQueryOptions = () => {
  return queryOptions({
    queryKey: [GET_LOAN_FORMS_QUERY_KEY],
    queryFn: () => getLoanFormsRpc(),
  })
}

export const getLoanFormDetailQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: [GET_LOAN_FORMS_QUERY_KEY, id],
    queryFn: () => getLoanFormDetailRpc({ data: { id } }),
  })
}

export const useGetLoanFormsQuery = () => {
  return useSuspenseQuery(getLoanFormsQueryOptions())
}

export const useCreateLoanFormMutation = () => {
  const createLoanFormFn = useServerFn(createLoanFormRpc)

  return useMutation({
    meta: { invalidates: [[GET_LOAN_FORMS_QUERY_KEY]] },
    mutationFn: (data: TCreateLoanFormValues) => createLoanFormFn({ data }),
  })
}

export const useUpdateLoanFormMutation = () => {
  const updateLoanFormFn = useServerFn(updateLoanFormRpc)

  return useMutation({
    meta: { invalidates: [[GET_LOAN_FORMS_QUERY_KEY]] },
    mutationFn: (data: TUpdateLoanFormValues) => updateLoanFormFn({ data }),
  })
}

export const useCheckoutLoanFormMutation = () => {
  const checkoutLoanFormFn = useServerFn(checkoutLoanFormRpc)

  return useMutation({
    meta: { invalidates: [[GET_LOAN_FORMS_QUERY_KEY]] },
    mutationFn: ({ id }: { id: number }) => checkoutLoanFormFn({ data: { id } }),
  })
}

export const useCancelLoanFormMutation = () => {
  const cancelLoanFormFn = useServerFn(cancelLoanFormRpc)

  return useMutation({
    meta: { invalidates: [[GET_LOAN_FORMS_QUERY_KEY]] },
    mutationFn: ({ id }: { id: number }) => cancelLoanFormFn({ data: { id } }),
  })
}

export const useConfirmLoanDepositMutation = () => {
  const confirmLoanDepositFn = useServerFn(confirmLoanDepositRpc)

  return useMutation({
    meta: { invalidates: [[GET_LOAN_FORMS_QUERY_KEY]] },
    mutationFn: ({ id }: { id: number }) => confirmLoanDepositFn({ data: { id } }),
  })
}

export const useStartLoanShippingMutation = () => {
  const startLoanShippingFn = useServerFn(startLoanShippingRpc)

  return useMutation({
    meta: { invalidates: [[GET_LOAN_FORMS_QUERY_KEY]] },
    mutationFn: ({ id }: { id: number }) => startLoanShippingFn({ data: { id } }),
  })
}

export const useCompleteLoanDeliveryMutation = () => {
  const completeLoanDeliveryFn = useServerFn(completeLoanDeliveryRpc)

  return useMutation({
    meta: { invalidates: [[GET_LOAN_FORMS_QUERY_KEY]] },
    mutationFn: ({ id }: { id: number }) => completeLoanDeliveryFn({ data: { id } }),
  })
}

export const useAddLoanItemsMutation = () => {
  const addLoanItemsFn = useServerFn(addLoanItemsRpc)

  return useMutation({
    meta: { invalidates: [[GET_LOAN_FORMS_QUERY_KEY]] },
    mutationFn: ({ id, skus }: { id: number; skus: string[] }) => addLoanItemsFn({ data: { id, skus } }),
  })
}

export const useCreateCustomerOrderMutation = () => {
  const createCustomerOrderFn = useServerFn(createCustomerOrderRpc)

  return useMutation({
    meta: { invalidates: [[GET_LOAN_FORMS_QUERY_KEY]] },
    mutationFn: (data: Parameters<typeof createCustomerOrderRpc>[0]['data']) =>
      createCustomerOrderFn({ data }),
  })
}

export const useDeleteLoanFormMutation = () => {
  const deleteLoanFormFn = useServerFn(deleteLoanFormRpc)

  return useMutation({
    meta: { invalidates: [[GET_LOAN_FORMS_QUERY_KEY]] },
    mutationFn: ({ id, permanently }: { id: number; permanently?: boolean }) =>
      deleteLoanFormFn({ data: { id, permanently } }),
  })
}

