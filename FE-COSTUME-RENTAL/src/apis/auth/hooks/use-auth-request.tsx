import { queryOptions, useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { getProfileRpc, logOutFn, updateProfileRpc } from '../rpc'
import { useCartStore } from '@/hooks/use-cart-store'
import { GET_USERS_QUERY_KEY } from '@/apis/user/hooks/use-user-request'

export const GET_PROFILE_QUERY_KEY = ['profile'] as const

export const getAuthUserQueryOptions = () => {
  return queryOptions({
    queryKey: GET_PROFILE_QUERY_KEY,
    queryFn: () => getProfileRpc(),
    staleTime: 0,
  })
}

export const useGetAuthUserQuery = () => {
  return useQuery(getAuthUserQueryOptions())
}

/**
 * @summary Custom hook that provides authentication-related functionality.
 */
export default function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const logOut = useServerFn(logOutFn)
  const { data: user } = useGetAuthUserQuery()

  useEffect(() => {
    useCartStore.getState().switchUser(user?.username ?? null)
  }, [user?.username])

  const { mutateAsync: logOutAsync } = useMutation({
    mutationFn: () => logOut(),
    onMutate: () => {
      const queryCache = queryClient.getQueryCache()
      const cancelledQueryKeys = queryCache.getAll().reduce<QueryKey>((accumulator, currentQuery) => {
        if (currentQuery.state.status === 'pending' || currentQuery.state.status === 'error')
          return [...accumulator, ...currentQuery.queryKey.filter((key) => !!key)]
        else return accumulator
      }, [])
      queryClient.cancelQueries({ queryKey: cancelledQueryKeys, exact: false })
      return toast.loading('Đang xử lý ...')
    },
    onSettled: async (_data, _error, _variable, context) => {
      await logOut()
      queryClient.removeQueries({ type: 'all', exact: false }) // * remove all triggered queries
      queryClient.clear() // * clear cached queries
      router.navigate({ to: '/login' })
      toast.success('Đăng xuất thành công', { id: context })
    },
  })

  const isAuthenticated = !!user

  return { user, isAuthenticated, logout: logOutAsync }
}

export const useLogOutMutation = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const logOut = useServerFn(logOutFn)

  return useMutation({
    mutationFn: () => logOut(),
    onMutate: () => {
      const queryCache = queryClient.getQueryCache()
      const cancelledQueryKeys = queryCache.getAll().reduce<QueryKey>((accumulator, currentQuery) => {
        if (currentQuery.state.status === 'pending' || currentQuery.state.status === 'error')
          return [...accumulator, ...currentQuery.queryKey.filter((key) => !!key)]
        else return accumulator
      }, [])
      queryClient.cancelQueries({ queryKey: cancelledQueryKeys, exact: false })
      return toast.loading('Đang xử lý ...')
    },
    onSettled: async (_data, _error, _variable, context) => {
      queryClient.removeQueries({ type: 'all', exact: false }) // * remove all triggered queries
      queryClient.clear() // * clear cached queries
      router.navigate({ to: '/login' })
      toast.success('Đăng xuất thành công', { id: context })
    },
  })
}

export const useUpdateProfileMutation = () => {
  const updateProfile = useServerFn(updateProfileRpc)
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: { username?: string; email?: string; password?: string | null }) =>
      updateProfile({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GET_PROFILE_QUERY_KEY as any })
      queryClient.invalidateQueries({ queryKey: [GET_USERS_QUERY_KEY] })
      router.invalidate()
    },
  })
}
