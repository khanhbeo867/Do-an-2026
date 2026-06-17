import { deleteUserRpc } from '@/apis/user/rpc'
import { CommonActions } from '@/common/constants/enums'
import { queryOptions, useMutation, useSuspenseQuery, type MutationFunction } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { toast } from 'sonner'
import { createEmployeeRpc, getEmployeeRpc, updateEmployeeRpc } from '../rpc'
import type { TCreateEmployeeValues } from '../schemas/create-employee.schema'
import type { TUpdateEmployeeValues } from '../schemas/update-employee.schema'
import type { IEmployee } from '../types'

export const GET_EMPLOYEE_QUERY_KEY = 'employees'

export const getEmployeeQueryOptions = (params?: RequestQuery) => {
  const queryKey = [GET_EMPLOYEE_QUERY_KEY]
  if (params) queryKey.push(params as any)
  return queryOptions({
    queryKey,
    queryFn: () => getEmployeeRpc({ data: params }),
  })
}

export const useGetEmployeesQuery = (params?: RequestQuery) => {
  return useSuspenseQuery(getEmployeeQueryOptions(params))
}

type TMutationEventMap = {
  [CommonActions.CREATE]: {
    handler: (payload: TCreateEmployeeValues) => Promise<IEmployee>
    message: string
  }
  [CommonActions.UPDATE]: {
    handler: (payload: TUpdateEmployeeValues) => Promise<IEmployee>
    message: string
  }
  ['none']: { handler: MutationFunction<any, any>; message?: never }
}

export const useCreateOrUpdateEmployeeMutataion = (action: CommonActions.CREATE | CommonActions.UPDATE | 'none') => {
  const toastRef = useRef<string | number | null>(null)
  const createEmployeeFn = useServerFn(createEmployeeRpc)
  const updateEmployeeFn = useServerFn(updateEmployeeRpc)

  const mutationEventMap: TMutationEventMap = {
    [CommonActions.CREATE]: {
      handler: (data: TCreateEmployeeValues) => createEmployeeFn({ data }),
      message: 'Thêm mới nhân viên thành công',
    },

    [CommonActions.UPDATE]: {
      handler: (data) => updateEmployeeFn({ data }),
      message: 'Đã cập nhật thành công',
    },
    ['none']: { handler: () => Promise.resolve() },
  }

  const currentConfig = mutationEventMap[action]

  return useMutation({
    meta: {
      invalidates: [[GET_EMPLOYEE_QUERY_KEY]],
    },
    mutationFn: currentConfig.handler,
    onMutate: () => {
      toastRef.current = toast.loading('Đang xử lý ...')
    },
    onSuccess: () => {
      toast.success(currentConfig?.message, { id: toastRef.current! })
    },
    onError: () => {
      toast.error('Đã có lỗi xảy ra !', { id: toastRef.current! })
    },
  })
}

export const useDeleteUserMutation = () => {
  const deleteUserFn = useServerFn(deleteUserRpc)

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteUserFn({ data: id })
    },
    meta: {
      invalidates: [[GET_EMPLOYEE_QUERY_KEY]],
    },
  })
}
