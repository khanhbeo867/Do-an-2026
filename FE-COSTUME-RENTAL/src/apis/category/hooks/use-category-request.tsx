import { CommonActions, ItemType } from '@/common/constants/enums'
import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
  type MutationFunction,
  type QueryKey,
} from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { createCategoryRpc, deleteCategoryRpc, getCategoriesRpc, getOneCategoryRpc, updateCategoryRpc } from '../rpc'
import type { TCreateCategoryValues } from '../schemas/create-category.schema'
import type { TDeleteCategoryReqValues } from '../schemas/delete-category.schema'
import type { TGetCategoryQueryValue } from '../schemas/get-category-type.schema'
import type { TUpdateCategoryValues } from '../schemas/update-category.schema'
import type { ICategory } from '../types'

export const GET_CATEGORIES_QUERY_KEY = 'categories'

export const GET_COSTUME_CATEGORY_QUERY_KEY: TGetCategoryQueryValue = {
  'type:eq': ItemType.COSTUME,
  _embed: 'costumes',
}

export const GET_PROPS_CATEGORY_QUERY_KEY: TGetCategoryQueryValue = {
  'type:eq': ItemType.EQUIPMENT_PROPS,
  _embed: 'equipment_props',
}

export const getCategoriesQueryOptions = (params?: TGetCategoryQueryValue) => {
  return queryOptions({
    queryKey: [GET_CATEGORIES_QUERY_KEY, params],
    queryFn: () => getCategoriesRpc({ data: params }),
    staleTime: 60 * 1000, // 1 minutes
  })
}

export const getOneCategoryQueryOptions = (id: number, _embed?: 'costumes' | 'equipment_props') => {
  const queryKey = [GET_CATEGORIES_QUERY_KEY, id]

  if (_embed) queryKey.push(_embed)

  return queryOptions({
    queryKey,
    queryFn: () => getOneCategoryRpc({ data: { id, _embed: _embed } }),
  })
}

export const useGetCategoriesQuery = (params?: TGetCategoryQueryValue) => {
  return useSuspenseQuery(getCategoriesQueryOptions(params))
}

type TMutationEventMap = {
  [CommonActions.CREATE]: {
    handler: (data: TCreateCategoryValues) => Promise<Nullable<ICategory>>
    message: string
  }
  [CommonActions.UPDATE]: {
    handler: (data: TUpdateCategoryValues) => Promise<Nullable<ICategory>>
    message: string
  }
  none: {
    handler: MutationFunction<any, any>
    message?: never
  }
}

export const useCreateOrUpdateCategoryMutation = (
  action: CommonActions.CREATE | CommonActions.UPDATE | 'none',
  mutationKey: TGetCategoryQueryValue
) => {
  const createCategoryFn = useServerFn(createCategoryRpc)
  const updateCategoryFn = useServerFn(updateCategoryRpc)

  const mutationEventMap: TMutationEventMap = {
    [CommonActions.CREATE]: {
      handler: (data) => createCategoryFn({ data }),
      message: 'Thêm mới danh mục thành công',
    },
    [CommonActions.UPDATE]: {
      handler: (data) => updateCategoryFn({ data }),
      message: 'Cập nhật danh mục thành công',
    },
    none: {
      handler: () => Promise.resolve(),
    },
  }

  const currentConfig = mutationEventMap[action]

  const invalidates = [[GET_CATEGORIES_QUERY_KEY], [GET_CATEGORIES_QUERY_KEY, mutationKey]]

  return useMutation({
    meta: { invalidates },
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

export const useDeleteCategoryMutation = (mutationKey: Array<QueryKey>) => {
  const deleteCategoryFn = useServerFn(deleteCategoryRpc)

  return useMutation({
    meta: { invalidates: mutationKey },
    mutationFn: (data: TDeleteCategoryReqValues) => deleteCategoryFn({ data }),
    onSuccess: () => {
      toast.success('Xóa danh mục thành công')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    },
  })
}
