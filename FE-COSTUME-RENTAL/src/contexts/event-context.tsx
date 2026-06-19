import type { CommonActions } from '@/common/constants/enums'
import { useEventEmitter } from 'ahooks'
import { type EventEmitter } from 'ahooks/lib/useEventEmitter'
import { createContext, use } from 'react'

export type EventEmitterValue<D extends Partial<IBaseEntity>> =
  | { action: CommonActions.CREATE; payload?: never }
  | { action: CommonActions; payload: D }

type TPageContext<T = any> = {
  event$: EventEmitter<T>
}

const PageContext = createContext<TPageContext | null>(null)

export function PageEventProvider<T>({ children }: React.PropsWithChildren) {
  const event$ = useEventEmitter<T>()

  return <PageContext.Provider value={{ event$ }}>{children}</PageContext.Provider>
}

export const usePageEventContext = () => {
  const context = use(PageContext)
  if (!context) {
    throw new Error('usePageEventContext must be used within a PageEventProvider')
  }
  return context
}
