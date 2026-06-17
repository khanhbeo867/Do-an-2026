import { CommonActions } from '@/common/constants/enums'
import { queryOptions, useMutation, useSuspenseQuery, type MutationFunction } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { createCostumeRpc, deleteCostumeRpc, getCostumeDetailRpc, getCostumesRpc, updateCostumeRpc } from '../rpc'
import type { TCreateCostumeValues } from '../schemas/create-costume.schema'
import type { TUpdateCostumeValues } from '../schemas/update-costume.schema'
import type { ICostume } from '../types'

export const GET_COSTUMES_QUERY_KEY = 'costumes' as const

export const getCostumesQueryOptions = () => {
  return queryOptions({
    queryKey: [GET_COSTUMES_QUERY_KEY],
    queryFn: () => getCostumesRpc(),
  })
}

export const getCostumeDetailQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: [GET_COSTUMES_QUERY_KEY, id],
    queryFn: () => getCostumeDetailRpc({ data: id }),
  })
}

export const useGetCostumesQuery = () => {
  return useSuspenseQuery(getCostumesQueryOptions())
}

export const useGetCostumeDetailQuery = (id: number) => {
  return useSuspenseQuery(getCostumeDetailQueryOptions(id))
}

type TMutationEventMap = {
  [CommonActions.CREATE]: {
    handler: (data: TCreateCostumeValues) => Promise<ICostume>
    message: string
  }
  [CommonActions.UPDATE]: {
    handler: (data: TUpdateCostumeValues) => Promise<ICostume>
    message: string
  }
  none: {
    handler: MutationFunction<any, any>
    message?: never
  }
}

export const useCreateOrUpdateCostumeMutation = (action: CommonActions.CREATE | CommonActions.UPDATE | 'none') => {
  const createCostumeFn = useServerFn(createCostumeRpc)
  const updateCostumeFn = useServerFn(updateCostumeRpc)

  const mutationEventMap: TMutationEventMap = {
    [CommonActions.CREATE]: {
      handler: (data: TCreateCostumeValues) => createCostumeFn({ data }),
      message: 'Thêm mới trang phục thành công',
    },
    [CommonActions.UPDATE]: {
      handler: async (data: TUpdateCostumeValues) => updateCostumeFn({ data }),
      message: 'Cập nhật trang phục thành công',
    },
    none: {
      handler: () => Promise.resolve(),
    },
  }

  const currentConfig = mutationEventMap[action]

  return useMutation({
    meta: {
      invalidates: [[GET_COSTUMES_QUERY_KEY]],
    },
    mutationFn: currentConfig.handler,
    onSuccess: () => {
      if (currentConfig.message) {
        toast.success(currentConfig.message)
      }
    },
    onError: () => {
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    },
  })
}

export const useDeleteCostumeMutation = () => {
  const deleteCostumeFn = useServerFn(deleteCostumeRpc)

  return useMutation({
    meta: {
      invalidates: [[GET_COSTUMES_QUERY_KEY]],
    },
    mutationFn: (id: number) => deleteCostumeFn({ data: id }),
    onSuccess: () => {
      toast.success('Xóa trang phục thành công')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    },
  })
}
