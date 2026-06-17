import { cookieOptions } from '@/apis/auth/configs/cookie.config'
import type { IUser } from '@/apis/user/types'
import request from '@/lib/request'
import { isRedirect, redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const accessToken = getCookie('accessToken')

  if (!accessToken) throw redirect({ to: '/login' })

  try {
    const user = await request<Nullable<IUser>>({
      url: '/auth/me',
      headers: { authorization: `Bearer ${accessToken}` },
    })

    if (!user) {
      setCookie('accessToken', '', { ...cookieOptions, maxAge: 0 })
      throw redirect({ to: '/login' })
    }

    return await next({ context: { accessToken, user } })
  } catch (err) {
    if (isRedirect(err)) throw err
    throw redirect({ to: '/login' })
  }
})

export const guestMiddleware = createMiddleware({ type: 'request' }).server(async ({ next }) => {
  const accessToken = getCookie('accessToken')

  if (accessToken) {
    try {
      const user = await request<Nullable<IUser>>({
        url: '/auth/me',
        headers: { authorization: `Bearer ${accessToken}` },
      })
      if (user) {
        if (user.role === 'USER') {
          throw redirect({ to: '/' })
        } else {
          throw redirect({ to: '/statistics' })
        }
      }
    } catch (err) {
      if (isRedirect(err)) throw err
      setCookie('accessToken', '', { ...cookieOptions, maxAge: 0 })
    }
  }

  return next({ context: { accessToken } })
})

export const optionalAuthMiddleware = createMiddleware().server(async ({ next }) => {
  const accessToken = getCookie('accessToken')

  if (!accessToken) {
    return await next({
      context: {
        accessToken: undefined as string | undefined,
        user: null as IUser | null,
      },
    })
  }

  try {
    const user = await request<Nullable<IUser>>({
      url: '/auth/me',
      headers: { authorization: `Bearer ${accessToken}` },
    })

    if (!user) {
      setCookie('accessToken', '', { ...cookieOptions, maxAge: 0 })
      return await next({
        context: {
          accessToken: undefined as string | undefined,
          user: null as IUser | null,
        },
      })
    }

    return await next({
      context: {
        accessToken: accessToken as string | undefined,
        user: user as IUser | null,
      },
    })
  } catch {
    return await next({
      context: {
        accessToken: undefined as string | undefined,
        user: null as IUser | null,
      },
    })
  }
})


