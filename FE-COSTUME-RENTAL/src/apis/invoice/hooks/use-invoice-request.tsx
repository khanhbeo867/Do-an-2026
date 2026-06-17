import { queryOptions, useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getInvoicesRpc, payInvoiceRpc, customerPayInvoiceRpc } from '../rpc'

export const GET_INVOICES_QUERY_KEY = 'invoices' as const

export const getInvoicesQueryOptions = () => {
  return queryOptions({
    queryKey: [GET_INVOICES_QUERY_KEY],
    queryFn: () => getInvoicesRpc(),
  })
}

export const useGetInvoicesQuery = () => {
  return useSuspenseQuery(getInvoicesQueryOptions())
}

export const usePayInvoiceMutation = () => {
  const payInvoiceFn = useServerFn(payInvoiceRpc)

  return useMutation({
    meta: { invalidates: [[GET_INVOICES_QUERY_KEY], ['loan_forms']] },
    mutationFn: ({ id }: { id: number }) => payInvoiceFn({ data: { id } }),
  })
}

export const useCustomerPayInvoiceMutation = () => {
  const customerPayInvoiceFn = useServerFn(customerPayInvoiceRpc)

  return useMutation({
    meta: { invalidates: [[GET_INVOICES_QUERY_KEY], ['loan_forms']] },
    mutationFn: ({ id }: { id: number }) => customerPayInvoiceFn({ data: { id } }),
  })
}
