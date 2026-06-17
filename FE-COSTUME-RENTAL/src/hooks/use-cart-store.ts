import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string // combination of productId and size e.g. "prod1_S"
  productId: string
  name: string
  image: string
  price: number
  size?: string
  quantity: number
  type: 'costume' | 'props'
  selected: boolean
}

interface CartState {
  items: CartItem[]
  carts: Record<string, CartItem[]>
  activeUsername: string | null

  switchUser: (username: string | null) => void
  addItem: (item: Omit<CartItem, 'selected'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  toggleSelect: (id: string) => void
  toggleSelectAll: (selected: boolean) => void
  clearCart: () => void
  clearSelected: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      carts: {},
      activeUsername: null,

      switchUser: (username) =>
        set((state) => {
          const oldUsername = state.activeUsername ?? 'guest'
          const updatedCarts = {
            ...state.carts,
            [oldUsername]: state.items,
          }
          const newUsername = username ?? 'guest'
          const newItems = username === null ? [] : (updatedCarts[newUsername] ?? [])

          return {
            carts: {
              ...updatedCarts,
              guest: [], // Force guest cart to be empty on logout
            },
            items: newItems,
            activeUsername: username,
          }
        }),

      addItem: (newItem) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId && item.size === newItem.size
          )
          let updatedItems: CartItem[]
          if (existingIndex > -1) {
            updatedItems = [...state.items]
            updatedItems[existingIndex].quantity += newItem.quantity
          } else {
            updatedItems = [...state.items, { ...newItem, selected: true }]
          }

          const currentUsername = state.activeUsername ?? 'guest'
          return {
            items: updatedItems,
            carts: {
              ...state.carts,
              [currentUsername]: updatedItems,
            },
          }
        }),

      removeItem: (id) =>
        set((state) => {
          const updatedItems = state.items.filter((item) => item.id !== id)
          const currentUsername = state.activeUsername ?? 'guest'
          return {
            items: updatedItems,
            carts: {
              ...state.carts,
              [currentUsername]: updatedItems,
            },
          }
        }),

      updateQuantity: (id, quantity) =>
        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          )
          const currentUsername = state.activeUsername ?? 'guest'
          return {
            items: updatedItems,
            carts: {
              ...state.carts,
              [currentUsername]: updatedItems,
            },
          }
        }),

      toggleSelect: (id) =>
        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.id === id ? { ...item, selected: !item.selected } : item
          )
          const currentUsername = state.activeUsername ?? 'guest'
          return {
            items: updatedItems,
            carts: {
              ...state.carts,
              [currentUsername]: updatedItems,
            },
          }
        }),

      toggleSelectAll: (selected) =>
        set((state) => {
          const updatedItems = state.items.map((item) => ({ ...item, selected }))
          const currentUsername = state.activeUsername ?? 'guest'
          return {
            items: updatedItems,
            carts: {
              ...state.carts,
              [currentUsername]: updatedItems,
            },
          }
        }),

      clearCart: () =>
        set((state) => {
          const currentUsername = state.activeUsername ?? 'guest'
          return {
            items: [],
            carts: {
              ...state.carts,
              [currentUsername]: [],
            },
          }
        }),

      clearSelected: () =>
        set((state) => {
          const updatedItems = state.items.filter((item) => !item.selected)
          const currentUsername = state.activeUsername ?? 'guest'
          return {
            items: updatedItems,
            carts: {
              ...state.carts,
              [currentUsername]: updatedItems,
            },
          }
        }),
    }),
    {
      name: 'costume-rental-cart',
    }
  )
)
