import { pick } from 'lodash-es'
import { use } from 'react'
import { type StoreApi, useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

/**
 * @description A function return a custom hook to select state from a Zustand store within a React context.
 * @author quanghiep03198
 * @param {React.Context<StoreApi<T extends { [K in keyof T]: any }>>} context - The React context containing the Zustand store.
 * @returns A function that takes selectors and returns the selected state.
 */
export const createStoreSelector = <T extends { [K in keyof T]: any }>(context: React.Context<StoreApi<T>>) => {
  return <K extends keyof T>(...selectors: K[]) => {
    const store = use(context)
    if (!store) throw new Error('Missing store provider')
    if (!selectors) return useStore(store)
    return useStore(
      store,
      useShallow((state) => pick(state, selectors))
    ) as Pick<T, K>
  }
}
