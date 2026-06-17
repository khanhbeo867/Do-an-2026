import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getStatisticsRpc } from '../rpc'
import type { IStatisticsQueryParams } from '../types'

export const GET_STATISTICS_QUERY_KEY = 'statistics' as const

export const getStatisticsQueryOptions = (params?: IStatisticsQueryParams) => {
  return queryOptions({
    queryKey: [GET_STATISTICS_QUERY_KEY, params],
    queryFn: () => getStatisticsRpc({ data: params }),
  })
}

export const useGetStatisticsQuery = (params?: IStatisticsQueryParams) => {
  return useSuspenseQuery(getStatisticsQueryOptions(params))
}
