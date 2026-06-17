// import { getServerTokenFn } from '@/apis/auth/functions'
import { getAuthUserQueryOptions } from '@/apis/auth/hooks/use-auth-request'
import LoginPage from '@/components/blocks/login'
import { guestMiddleware } from '@/middlewares/auth.middleware'
import { createFileRoute, isRedirect, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  head: () => ({
    meta: [
      { title: 'Đăng nhập hệ thống' },
      {
        name: 'description',
        content: 'Đăng nhập vào hệ thống quản lý costume rental để truy cập các chức năng nội bộ.',
      },
    ],
  }),
  component: LoginPage,
  beforeLoad: async ({ context }) => {
    try {
      const user = await context.queryClient.ensureQueryData(getAuthUserQueryOptions())
      if (user) {
        if (user.role === 'USER') {
          throw redirect({ to: '/' })
        } else {
          throw redirect({ to: '/statistics' })
        }
      }
    } catch (err) {
      if (isRedirect(err)) throw err
    }
  },
  server: {
    middleware: [guestMiddleware],
  },
})

