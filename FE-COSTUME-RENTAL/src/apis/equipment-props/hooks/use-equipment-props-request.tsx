import { CommonActions } from '@/common/constants/enums'
import { queryOptions, useMutation, useSuspenseQuery, type MutationFunction } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import {
  createEquipmentPropsRpc,
  deleteEquipmentPropsRpc,
  getEquipmentPropsRpc,
  getPropsDetailRpc,
  updateEquipmentPropsRpc,
} from '../rpc'
import type { TCreateEquipmentPropsValues } from '../schemas/create-equipment-props.schema'
import type { TUpdateEquipmentPropsValues } from '../schemas/update-equipment-props.schema'
import type { IEquipmentProps } from '../types'

export const GET_PROPS_QUERY_KEY = 'equipment_props' as const

export const getPropsQueryOptions = () => {
  return queryOptions({
    queryKey: [GET_PROPS_QUERY_KEY],
    queryFn: () => getEquipmentPropsRpc(),
    staleTime: 0,
  })
}

export const getPropsDetailQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: [GET_PROPS_QUERY_KEY, id],
    queryFn: () => getPropsDetailRpc({ data: id }),
  })
}

export const useGetPropsQuery = () => {
  return useSuspenseQuery(getPropsQueryOptions())
}

export const useGetPropsDetailQuery = (id: number) => {
  return useSuspenseQuery(getPropsDetailQueryOptions(id))
}

type TMutationEventMap = {
  [CommonActions.CREATE]: {
    handler: (data: TCreateEquipmentPropsValues) => Promise<IEquipmentProps>
    message: string
  }
  [CommonActions.UPDATE]: {
    handler: (data: TUpdateEquipmentPropsValues) => Promise<IEquipmentProps>
    message: string
  }
  none: {
    handler: MutationFunction<any, any>
    message?: never
  }
}

export const useCreateOrUpdatePropsMutation = (action: CommonActions.CREATE | CommonActions.UPDATE | 'none') => {
  const createEquipmentPropsFn = useServerFn(createEquipmentPropsRpc)
  const updateEquipmentPropsFn = useServerFn(updateEquipmentPropsRpc)

  const mutationEventMap: TMutationEventMap = {
    [CommonActions.CREATE]: {
      handler: (data: TCreateEquipmentPropsValues) => createEquipmentPropsFn({ data }),
      message: 'Thêm mới đạo cụ thành công',
    },
    [CommonActions.UPDATE]: {
      handler: async (data: TUpdateEquipmentPropsValues) => {
        return await updateEquipmentPropsFn({ data })
      },
      message: 'Cập nhật đạo cụ thành công',
    },
    none: {
      handler: () => Promise.resolve(),
    },
  }

  const currentConfig = mutationEventMap[action]

  return useMutation({
    meta: {
      invalidates: [[GET_PROPS_QUERY_KEY]],
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

export const useDeletePropsMutation = () => {
  const deleteEquipmentPropsFn = useServerFn(deleteEquipmentPropsRpc)

  return useMutation({
    meta: {
      invalidates: [[GET_PROPS_QUERY_KEY]],
    },
    mutationFn: async (id: number) => deleteEquipmentPropsFn({ data: id }),
    onSuccess: () => {
      toast.success('Xóa trang phục thành công')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    },
  })
}
