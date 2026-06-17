import type { IUser } from '@/apis/user/types'
import request, { type RequestConfig } from '@/lib/request'
import { createMiddleware } from '@tanstack/react-start'

export const requestMiddleware = createMiddleware().server(async ({ next, context }) => {
  const contextWithAuth = context as { user: IUser; accessToken: string } | undefined

  return await next({
    context: {
      ...contextWithAuth,
      request: async <R = any, D = any>(config: RequestConfig<D>) => {
        config.headers ??= {}

        if (contextWithAuth && contextWithAuth?.accessToken) {
          config.headers.authorization = `Bearer ${contextWithAuth.accessToken}`
        }

        return await request<R>(config)
      },
    },
  })
})
