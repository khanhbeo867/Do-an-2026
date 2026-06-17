import type {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  GlobalFilterTableState,
  Row,
  SortingState,
  Table,
  TableOptions,
  TableState,
} from '@tanstack/react-table'
import type { VirtualizerOptions } from '@tanstack/react-virtual'
import { EventEmitter } from 'ahooks/lib/useEventEmitter'
import React from 'react'

export type ToolbarProps =
  | {
      override: true
      render: React.FC<{
        table: Table<any>
        event$: EventEmitter<Record<string, unknown>>
      }>
    }
  | {
      override?: false
      rtl?: boolean
      slotLeft?: React.FC<{ table: Table<any> }>
      slotRight?: React.FC<{ table: Table<any> }>
    }

export type TableFooterProps = {
  hidden?: boolean
  rtl?: boolean
  slot?: React.FC<{ table: Table<any> }>
} & React.PropsWithChildren

// #region Pagination prop types
export type PaginationBaseProps = {
  enableInputPageSize?: boolean
  prefetch?: (params: Record<string, any>) => void
} & Partial<Omit<Pagination<any>, 'data'>>

type PaginationProps =
  | {
      manualPagination: true
      paginationProps: PaginationBaseProps
    }
  | {
      manualPagination?: false
      paginationProps?: PaginationBaseProps
    }

// #region Column filters prop types
type ColumnFilterProps =
  | {
      manualFiltering: true
      columnFilters: ColumnFiltersState
      onColumnFiltersChange: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
    }
  | {
      manualFiltering?: false
      columnFilters?: ColumnFiltersState
      onColumnFiltersChange?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
    }

// #region Global filter prop types
type GlobalFilterProps =
  | {
      manualFiltering: true
      enableGlobalFilter: true
      globalFilter: GlobalFilterTableState['globalFilter']
      onGlobalFilterChange: React.Dispatch<React.SetStateAction<GlobalFilterTableState['globalFilter']>>
    }
  | {
      manualFiltering?: false
      // enableGlobalFilter?: false
      globalFilter?: GlobalFilterTableState['globalFilter']
      onGlobalFilterChange?: React.Dispatch<React.SetStateAction<GlobalFilterTableState['globalFilter']>>
    }

// #region Sorting prop types
type SortingProps =
  | {
      manualSorting: true
      sorting: SortingState
      onSortingChange: React.Dispatch<React.SetStateAction<SortingState>>
    }
  | {
      manualSorting?: false
      sorting?: SortingState
      onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>
    }

export type RenderSubComponentProps<TData = any> = {
  row: Row<TData>
  table: Table<TData>
}

export type RenderSubComponent<TData = any> = (props: { row: Row<TData>; table: Table<TData> }) => React.ReactElement

type PartialTableOptions = Partial<Omit<TableOptions<any>, 'data' | 'columns'>>

// #region Data table prop types
export type DataTableProps = PartialTableOptions &
  /**
   * Additional props in case you want to control pagination state from outside like server-side pagination.
   */
  PaginationProps &
  /**
   * Additional props in case you want to control column filtering state from outside like server-side filter.
   */
  ColumnFilterProps &
  /**
   * Additional props in case you want to control column filtering state from outside like server-side sorting.
   */
  SortingProps &
  /**
   * Additional props in case you want to control column filtering state from outside like server-side searching by term.
   */
  GlobalFilterProps & {
    /**
     * Array of data objects to be displayed in the table.
     */
    data: Array<any>
    /**
     * Array of column definitions for the table. Each column can have various properties such as header, accessor, etc.
     */
    columns: ColumnDef<any, any>[]
    /**
     * Reference to the table instance. Useful for accessing table methods and properties.
     */
    ref?: React.RefObject<Table<any>>
    /**
     * Table border style. Can be 'all' for full borders or 'bottom-only' for minimal borders.
     * @default 'all'
     */
    border?: 'all' | 'bottom-only'
    /**
     * Table caption, which can be used to provide a title or description for the table.
     * This is useful for accessibility and can be used by screen readers to describe the table content.
     */
    caption?: string
    /**
     * Loading state of the table. If true, skeleton loading will be shown.
     */
    loading?: boolean
    /**
     * Enable column resizing feature. This allows users to adjust the width of columns by dragging the edges.
     */
    enableColumnResizing?: boolean
    /**
     * Add some additional props to the table container component, like height, width, ...etc.
     */
    containerProps?: React.ComponentProps<'div'>
    /**
     * Optional function to render a custom header for the table.
     */
    toolbarProps?: ToolbarProps
    /**
     * Optional function to render a custom footer for the table.
     */
    footerProps?: TableFooterProps
    /**
     * Optional external expanded state in case you want to control the sorting state of the table from outside like server-side sorting.
     */
    sorting?: SortingState
    /**
     * If true, the filter row will be shown by default
     */
    defaultFilterOpen?: boolean
    /**
     * Optional external expanded state in case you want to control the expanded state of the table from outside.
     */
    expanded?: ExpandedState
    /**
     * Intial state of the table. Can be used to set default values for sorting, filtering, etc.
     */
    initialState?: Partial<TableState>
    /**
     * Optional function to render a custom caption for the table.
     */
    virtualizerOptions?: Pick<VirtualizerOptions<HTMLDivElement, HTMLTableRowElement>, 'enabled' | 'overscan'> & {
      estimateSize?: number
    }
    /**
     * Optional function to handle state changes in the table. This can be used to perform side effects when the table state changes.
     * @param {Table<any, TValue>} instance
     * @returns
     */
    onStateChange?: (instance: Table<any>) => void
    /**
     * Optional function to render sub-component for each row. This can be used to display additional information or actions related to the row.
     * @param {RenderSubComponentProps<any>} props
     * @returns
     */
    renderSubComponent?: (props: RenderSubComponentProps<any>) => React.ReactElement | React.JSX.Element
    /**
     * Optional function to generate custom CSS class names for each row based on row data.
     */
    getRowClassName?: (row: Row<any>) => string
  }

export type RowSelectionType = 'single' | 'multiple' | undefined
