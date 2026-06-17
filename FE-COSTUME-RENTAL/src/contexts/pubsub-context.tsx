import { createContext, type DependencyList, type ReactNode, use, useEffect, useMemo, useRef } from 'react'

type EventMapBase = Record<string, unknown>
type EventName<TEventMap extends EventMapBase> = Extract<keyof TEventMap, string>
type EventHandler<TPayload> = (payload: TPayload) => void
type Unsubscribe = () => void

type PubSubContextValue<TEventMap extends EventMapBase> = {
  publish: <TEvent extends EventName<TEventMap>>(event: TEvent, payload: TEventMap[TEvent]) => void
  subscribe: <TEvent extends EventName<TEventMap>>(
    event: TEvent,
    handler: EventHandler<TEventMap[TEvent]>
  ) => Unsubscribe
  once: <TEvent extends EventName<TEventMap>>(event: TEvent, handler: EventHandler<TEventMap[TEvent]>) => Unsubscribe
  unsubscribe: <TEvent extends EventName<TEventMap>>(event: TEvent, handler: EventHandler<TEventMap[TEvent]>) => void
  clear: (event?: EventName<TEventMap>) => void
  listenerCount: (event?: EventName<TEventMap>) => number
}

const createBus = <TEventMap extends EventMapBase>() => {
  const listeners = new Map<EventName<TEventMap>, Set<EventHandler<unknown>>>()

  const subscribe = <TEvent extends EventName<TEventMap>>(
    event: TEvent,
    handler: EventHandler<TEventMap[TEvent]>
  ): Unsubscribe => {
    const eventListeners = listeners.get(event) ?? new Set<EventHandler<unknown>>()
    eventListeners.add(handler as EventHandler<unknown>)
    listeners.set(event, eventListeners)

    let subscribed = true
    return () => {
      if (!subscribed) return
      subscribed = false

      const current = listeners.get(event)
      if (!current) return

      current.delete(handler as EventHandler<unknown>)
      if (current.size === 0) listeners.delete(event)
    }
  }

  const unsubscribe = <TEvent extends EventName<TEventMap>>(
    event: TEvent,
    handler: EventHandler<TEventMap[TEvent]>
  ) => {
    const eventListeners = listeners.get(event)
    if (!eventListeners) return

    eventListeners.delete(handler as EventHandler<unknown>)
    if (eventListeners.size === 0) listeners.delete(event)
  }

  const publish = <TEvent extends EventName<TEventMap>>(event: TEvent, payload: TEventMap[TEvent]) => {
    const eventListeners = listeners.get(event)
    if (!eventListeners || eventListeners.size === 0) return

    for (const listener of eventListeners) {
      try {
        ;(listener as EventHandler<TEventMap[TEvent]>)(payload)
      } catch (error) {
        console.error(`[PubSub] listener failed for event "${event}"`, error)
      }
    }
  }

  const once = <TEvent extends EventName<TEventMap>>(event: TEvent, handler: EventHandler<TEventMap[TEvent]>) => {
    let unsubscribeOnce: Unsubscribe = () => {}

    const onceHandler: EventHandler<TEventMap[TEvent]> = (payload) => {
      unsubscribeOnce()
      handler(payload)
    }

    unsubscribeOnce = subscribe(event, onceHandler)
    return unsubscribeOnce
  }

  const clear = (event?: EventName<TEventMap>) => {
    if (!event) {
      listeners.clear()
      return
    }

    listeners.delete(event)
  }

  const listenerCount = (event?: EventName<TEventMap>) => {
    if (!event) {
      let total = 0
      for (const eventListeners of listeners.values()) {
        total += eventListeners.size
      }
      return total
    }

    return listeners.get(event)?.size ?? 0
  }

  return {
    publish,
    subscribe,
    once,
    unsubscribe,
    clear,
    listenerCount,
  }
}

type PubSubProviderProps = {
  children: ReactNode
}

export const createPubSubContext = <TEventMap extends EventMapBase>(contextName = 'PubSubContext') => {
  const PubSubContext = createContext<PubSubContextValue<TEventMap> | undefined>(undefined)

  const PubSubProvider = ({ children }: PubSubProviderProps) => {
    const busRef = useRef(createBus<TEventMap>())

    const value = useMemo<PubSubContextValue<TEventMap>>(
      () => ({
        publish: busRef.current.publish,
        subscribe: busRef.current.subscribe,
        once: busRef.current.once,
        unsubscribe: busRef.current.unsubscribe,
        clear: busRef.current.clear,
        listenerCount: busRef.current.listenerCount,
      }),
      []
    )

    useEffect(() => {
      return () => {
        busRef.current.clear()
      }
    }, [])

    return <PubSubContext value={value}>{children}</PubSubContext>
  }

  const usePubSub = () => {
    const context = use(PubSubContext)
    if (!context) {
      throw new Error(`usePubSub must be used within ${contextName} Provider`)
    }
    return context
  }

  const usePubSubSubscription = <TEvent extends EventName<TEventMap>>(
    event: TEvent,
    handler: EventHandler<TEventMap[TEvent]>,
    deps: DependencyList = []
  ) => {
    const { subscribe } = usePubSub()

    useEffect(() => {
      const unsubscribe = subscribe(event, handler)
      return unsubscribe
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event, subscribe, ...deps])
  }

  return {
    PubSubProvider,
    usePubSub,
    usePubSubSubscription,
  }
}

export type { EventHandler, EventMapBase, PubSubContextValue, Unsubscribe }
