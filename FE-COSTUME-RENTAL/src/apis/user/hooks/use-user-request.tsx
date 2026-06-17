import { Position, WorkStatus } from '@/apis/employee/constants'
import { GET_EMPLOYEE_QUERY_KEY } from '@/apis/employee/hooks/use-employee-request'
import { CommonActions } from '@/common/constants/enums'
import { queryOptions, useMutation, useSuspenseQuery, type MutationFunction } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { toast } from 'sonner'
import { createUserRpc, deleteUserRpc, getUsersRpc, updateUserRpc } from '../rpc'
import type { TCreateUserValues } from '../schemas/create-user.schema'
import type { TUpdateUserValues } from '../schemas/update-user.schema'
import type { IUser } from '../types'

export const GET_USERS_QUERY_KEY = 'users' as const

export const getUsersQueryOptions = () => {
  return queryOptions({
    queryKey: [GET_USERS_QUERY_KEY],
    queryFn: getUsersRpc,
  })
}

export const useGetUsersQuery = () => {
  return useSuspenseQuery(getUsersQueryOptions())
}

type TMutationEventMap = {
  [CommonActions.CREATE]: {
    handler: (payload: TCreateUserValues) => Promise<IUser>
    message: string
  }
  [CommonActions.UPDATE]: {
    handler: ({ id, ...payload }: TUpdateUserValues) => Promise<IUser>
    message: string
  }
  none: {
    handler: MutationFunction<any, any>
    message?: string
  }
}

export const useCreateOrUpdateUserMutataion = (action: CommonActions.CREATE | CommonActions.UPDATE | 'none') => {
  const createUserFn = useServerFn(createUserRpc)
  const updateUserFn = useServerFn(updateUserRpc)

  const mutationEventMap: TMutationEventMap = {
    [CommonActions.CREATE]: {
      handler: (data: TCreateUserValues) => createUserFn({ data }),
      message: 'Thêm mới người dùng thành công',
    },
    [CommonActions.UPDATE]: {
      handler: (data: TUpdateUserValues) => updateUserFn({ data }),
      message: 'Đã cập nhật thành công',
    },
    none: {
      handler: () => Promise.resolve(),
    },
  }

  const toastRef = useRef<string | number | null>(null)
  const router = useRouter()
  const currentConfig = mutationEventMap[action]

  return useMutation({
    mutationFn: currentConfig.handler,
    meta: {
      invalidates: [
        [GET_USERS_QUERY_KEY],
        [
          GET_EMPLOYEE_QUERY_KEY,
          {
            'position:in': `${Position.MANAGER},${Position.ORDER_PROCESSOR},${Position.WAREHOUSE_MANAGER}`,
            'is_active:eq': true,
            'work_status:ne': WorkStatus.EXITED,
            'user_id:eq': null,
          },
        ],
      ],
    },
    onMutate: () => {
      toastRef.current = toast.loading('Đang xử lý ...')
    },
    onSuccess: () => {
      const message = currentConfig?.message || 'Thao tác thành công'
      router.invalidate()
      toast.success(message, { id: toastRef.current! })
    },
    onError: () => {
      toast.error('Đã có lỗi xảy ra !', { id: toastRef.current! })
    },
  })
}

export const useDeleteUserMutation = () => {
  const deleteUserFn = useServerFn(deleteUserRpc)

  return useMutation({
    mutationFn: (id: number) => deleteUserFn({ data: id }),
    meta: {
      invalidates: [
        [GET_USERS_QUERY_KEY],
        [
          GET_EMPLOYEE_QUERY_KEY,
          {
            'position:in': `${Position.MANAGER},${Position.ORDER_PROCESSOR},${Position.WAREHOUSE_MANAGER}`,
            'is_active:eq': true,
            'work_status:ne': WorkStatus.EXITED,
            'user_id:eq': null,
          },
        ],
      ],
    },
  })
}
