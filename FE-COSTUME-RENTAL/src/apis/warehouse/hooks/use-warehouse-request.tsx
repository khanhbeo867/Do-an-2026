import { CommonActions } from '@/common/constants/enums'
import { queryOptions, useMutation, useSuspenseQuery, type MutationFunction } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { createWarehouseRpc, deleteWarehouseRpc, getWarehousesRpc, updateWarehouseRpc } from '../rpc'
import type { TCreateWarehouseValues } from '../schemas/create-warehouse.schema'
import type { TUpdateWarehouseValues } from '../schemas/update-warehouse.schema'
import type { IWarehouse } from '../types'

export const GET_WAREHOUSES_QUERY_KEY = 'warehouses' as const

export const getWarehousesQueryOptions = () => {
  return queryOptions({
    queryKey: [GET_WAREHOUSES_QUERY_KEY],
    queryFn: () => getWarehousesRpc(),
  })
}

export const useGetWarehouseQuery = () => {
  return useSuspenseQuery(getWarehousesQueryOptions())
}

type TMutationEventMap = {
  [CommonActions.CREATE]: {
    handler: (payload: TCreateWarehouseValues) => Promise<IWarehouse>
    message: string
  }
  [CommonActions.UPDATE]: {
    handler: (payload: TUpdateWarehouseValues) => Promise<IWarehouse>
    message: string
  }
  ['none']: { handler: MutationFunction<any, any>; message?: never }
}

export const useCreateOrUpdateWarehouseMutation = (action: CommonActions.CREATE | CommonActions.UPDATE | 'none') => {
  const createWarehouseFn = useServerFn(createWarehouseRpc)
  const updateWarehouseFn = useServerFn(updateWarehouseRpc)

  const mutationEventMap: TMutationEventMap = {
    [CommonActions.CREATE]: {
      handler: async (data) => createWarehouseFn({ data }),
      message: 'Tạo kho thành công',
    },
    [CommonActions.UPDATE]: {
      handler: async (data) => updateWarehouseFn({ data }),
      message: 'Cập nhật kho thành công',
    },
    none: {
      handler: () => Promise.resolve(),
    },
  }

  const mutation = mutationEventMap[action]

  return useMutation({
    meta: { invalidates: [[GET_WAREHOUSES_QUERY_KEY]] },
    mutationFn: mutation.handler,
    onSuccess: () => {
      toast.success(mutation.message)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export const useDeleteWarehouseMutation = () => {
  const deleteWarehouseFn = useServerFn(deleteWarehouseRpc)

  return useMutation({
    meta: { invalidates: [[GET_WAREHOUSES_QUERY_KEY]] },
    mutationFn: ({ id, permanantly }: { id: number; permanantly: boolean }) =>
      deleteWarehouseFn({ data: { id, permanantly } }),
  })
}
