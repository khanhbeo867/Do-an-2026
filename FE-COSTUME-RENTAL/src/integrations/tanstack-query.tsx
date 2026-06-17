import { GlobalConfig } from '@/configs/global.config'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'
import { matchQuery, MutationCache, QueryClient, type QueryKey } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: Error
    mutationMeta: {
      invalidates?: Array<QueryKey>
    }
  }
}


export function createQueryClient() {
  const client: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 60 * 24, // 24h - must be >= maxAge for persister to work
        experimental_prefetchInRender: true,
        networkMode: 'always',
      },
      mutations: {
        networkMode: 'always',
      },
    },
  })

  client.getMutationCache().config.onSuccess = (_data, _variables, _context, mutation) => {
    client.invalidateQueries({
      predicate: (query) =>
        mutation.meta?.invalidates?.some((queryKey) => matchQuery({ queryKey }, query)) ?? true,
    })
  }

  return client
}

let clientInstance: QueryClient | undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return createQueryClient()
  }

  if (!clientInstance) {
    clientInstance = createQueryClient()

    // * Sharing states between multiple tabs
    broadcastQueryClient({
      queryClient: clientInstance as unknown as any,
      broadcastChannel: 'costume-rental', // Optional: defaults to 'react-query'
    })

    // * Persisting cache to localstorage
    const asyncLocalStoragePersister = createAsyncStoragePersister({
      storage: window.localStorage,
      key: GlobalConfig.QUERY_CLIENT_CACHE_STORAGE_KEY,
      serialize: (data) => JSON.stringify(data),
      deserialize: (data) => JSON.parse(data),
    })

    persistQueryClient({
      queryClient: clientInstance,
      persister: asyncLocalStoragePersister,
      maxAge: 1000 * 60 * 60 * 24, // 24h
    })
  }

  return clientInstance
}

export const queryClient = getQueryClient()

