import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getPenaltyFormsRpc } from '../rpc'

export const GET_PENALTY_FORMS_QUERY_KEY = 'penalty_forms' as const

export const getPenaltyFormsQueryOptions = () => {
  return queryOptions({
    queryKey: [GET_PENALTY_FORMS_QUERY_KEY],
    queryFn: () => getPenaltyFormsRpc(),
  })
}

export const useGetPenaltyFormsQuery = () => {
  return useSuspenseQuery(getPenaltyFormsQueryOptions())
}
