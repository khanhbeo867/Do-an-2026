import { createStoreSelector } from '@/hooks/use-store-selector'
import { type Table } from '@tanstack/react-table'
import { EventEmitter } from 'ahooks/lib/useEventEmitter'
import { createContext } from 'react'
import { type StoreApi } from 'zustand'

export type TableContextStore = {
  table: Table<any>
  filterOpen: boolean
  setFilterOpen: (open: boolean) => void
  event$: EventEmitter<Record<string, unknown>>
}

export const TableContext = createContext<StoreApi<TableContextStore>>({} as StoreApi<TableContextStore>)

export const TableContextProvider = TableContext.Provider

export const useTableContext = createStoreSelector(TableContext)
