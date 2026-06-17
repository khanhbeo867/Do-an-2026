import { FetchError } from '@/common/errors'
import { authMiddleware, optionalAuthMiddleware } from '@/middlewares/auth.middleware'
import { requestMiddleware } from '@/middlewares/request.middleware'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { setCookie } from '@tanstack/react-start/server'
import { z } from 'zod'
import { cookieOptions } from '../configs/cookie.config'
import { loginSchema, type TLoginValues } from '../schemas/login.schema'
import { registerSchema } from '../schemas/register.schema'
import type { TLoginResponse } from '../types'

export const loginRpc = createServerFn({ method: 'POST' })
  .middleware([requestMiddleware])
  .inputValidator(loginSchema)
  .handler(async ({ data, context }) => {
    try {
      const response = await context.request<TLoginResponse, TLoginValues>({
        url: '/auth/login',
        method: 'POST',
        data,
      })

      setCookie('accessToken', response!.access_token, cookieOptions)
      return response
    } catch (err: any) {
      if (err instanceof FetchError) {
        const body = err.body as any
        throw new Error(body?.message || err.message)
      }
      throw err
    }
  })

export const registerRpc = createServerFn({ method: 'POST' })
  .middleware([requestMiddleware])
  .inputValidator(registerSchema)
  .handler(async ({ data, context }) => {
    try {
      const response = await context.request({
        url: '/register',
        method: 'POST',
        data: {
          username: data.username,
          email: data.email,
          phone: data.phone,
          password: data.password,
          display_name: data.username,
        },
      })
      return response
    } catch (err: any) {
      if (err instanceof FetchError) {
        const body = err.body as any
        throw new Error(body?.message || err.message)
      }
      throw err
    }
  })


export const logOutFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .handler(async ({ context }) => {
    try {
      return await context.request({ url: '/auth/logout', method: 'POST' })
    } finally {
      setCookie('accessToken', '', { ...cookieOptions, maxAge: 0 })
      throw redirect({ to: '/login' })
    }
  })

export const getProfileRpc = createServerFn({ method: 'GET' })
  .middleware([optionalAuthMiddleware, requestMiddleware])
  .handler(({ context }) => {
    return context.user
  })

export const updateProfileRpc = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requestMiddleware])
  .inputValidator(
    z.object({
      username: z.string().min(3).optional(),
      email: z.string().optional().nullable(),
      password: z.string().min(6).optional().nullable(),
    })
  )
  .handler(async ({ data, context }) => {
    try {
      const response = await context.request({
        url: '/auth/profile',
        method: 'PATCH',
        data,
      })
      return response
    } catch (err: any) {
      if (err instanceof FetchError) {
        const body = err.body as any
        throw new Error(body?.message || err.message)
      }
      throw err
    }
  })

