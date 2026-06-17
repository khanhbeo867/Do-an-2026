import type { setCookie } from '@tanstack/react-start/server'

type CookieSerializeOptions = Parameters<typeof setCookie>[2]

export const cookieOptions: NonNullable<CookieSerializeOptions> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
}
