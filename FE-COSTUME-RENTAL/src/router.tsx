import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { scan } from 'react-scan'
import { ErrorBoundaryFallback } from './components/errors/error-boundary-fallback'
import { NotFoundPage } from './components/errors/not-found'
import { getQueryClient } from './integrations/tanstack-query'
import env from './lib/utils'
import { routeTree } from './routeTree.gen'

const runtimeEnvironment = env<RuntimeEnvironment>('VITE_NODE_ENV')

const isDevelopment = runtimeEnvironment === 'development'

// React Scan Initialization
scan({ enabled: isDevelopment })

export function getRouter() {
  const queryClient = getQueryClient()

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient: queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultErrorComponent: ErrorBoundaryFallback,
    defaultNotFoundComponent: NotFoundPage,
    Wrap: ({ children }: React.PropsWithChildren) => {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    },
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
