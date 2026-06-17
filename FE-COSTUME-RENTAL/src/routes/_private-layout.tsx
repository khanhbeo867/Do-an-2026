import { getAuthUserQueryOptions } from '@/apis/auth/hooks/use-auth-request'
import { ErrorBoundaryFallback } from '@/components/errors/error-boundary-fallback'
import AppNavbar from '@/components/layouts/app/app-navbar'
import AppSidebar from '@/components/layouts/app/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import tw from '@/lib/tw'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

export const Route = createFileRoute('/_private-layout')({
  head: () => ({
    meta: [
      { title: 'Hệ thống quản lý Costume Rental' },
      {
        name: 'description',
        content: 'Khu vực quản trị nội bộ cho hệ thống quản lý thuê và mua trang phục, đạo cụ.',
      },
    ],
  }),
  component: PrivateLayout,
  server: { middleware: [authMiddleware] },
  loader: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(getAuthUserQueryOptions())
    if (user && user.role === 'USER') {
      throw redirect({ to: '/' })
    }
    return { user }
  },

  errorComponent: ({ error, reset }) => {
    return <ErrorBoundaryFallback error={error as Error} resetError={reset} />
  },
})

function PrivateLayout() {
  return (
    <Suspense fallback={<div className="h-screen w-full grid place-content-center text-center">Đang tải ...</div>}>
      <SidebarProvider
        style={
          {
            '--sidebar-width': '20rem',
            '--sidebar-width-mobile': '20rem',
          } as React.CSSProperties
        }
      >
        {/* Thanh menu điều hướng */}
        <AppSidebar />
        <LayoutWrapper data-slot="layout-wrapper">
          {/* Thanh điều hướng trên thiết bị mobile */}
          <AppNavbar />
          <OutletWrapper data-slot="outlet-wrapper">
            <ErrorBoundary
              fallbackRender={({ error, resetErrorBoundary }) => {
                return (
                  <ErrorBoundaryFallback
                    error={error as Error}
                    resetError={(args) => {
                      resetErrorBoundary(args)
                    }}
                  />
                )
              }}
            >
              {/* Nội dung của trang web */}
              <Outlet />
            </ErrorBoundary>
          </OutletWrapper>
        </LayoutWrapper>
      </SidebarProvider>
    </Suspense>
  )
}

const LayoutWrapper: React.FC<React.ComponentProps<'div'>> = tw.div`
	relative h-screen max-h-full flex-1 w-full overflow-y-scroll @container/layout-wrapper flex flex-col justify-between
	[counter-reset:h_var(--screen-height)_w_var(--screen-width)]
	xxl:[--header-height:120px]
	sm:[--outlet-padding-x:8px] 
	md:[--outlet-padding-x:8px] 
	lg:[--outlet-padding-x:8px] 
	xl:[--outlet-padding-x:16px] 
	xxl:[--outlet-padding-x:24px] 
	[&:has(*[data-outlet-padding=none])]:[--outlet-padding-x:0px]
	[&:has(*[data-outlet-padding=none])]:[--outlet-padding-y:0px]
	[--scrollbar-thickness:10px] 
	[--outlet-padding-y:16px] 
	[--header-height:56px] 
	xl:[--outlet-wrapper-width:calc(var(--screen-width,100dvw)*1px-var(--sidebar-width)-2*var(--outlet-padding-x)-var(--scrollbar-thickness))]
	[--outlet-wrapper-width:calc(var(--screen-width,100dvw)*1px-2*var(--outlet-padding-x)-var(--scrollbar-thickness))]
	[--outlet-wrapper-height:calc(var(--screen-height,100dvh)*1px-var(--header-height)-2*var(--outlet-padding-x))]
`

const OutletWrapper: React.FC<React.ComponentProps<'main'>> = tw.main`
	relative flex-1 basis-full
	py-(--outlet-padding-y) px-(--outlet-padding-x) 
	min-h-(--outlet-wrapper-height) 
	max-w-[calc(var(--outlet-wrapper-width)+2*var(--outlet-padding-x))]
	
`
