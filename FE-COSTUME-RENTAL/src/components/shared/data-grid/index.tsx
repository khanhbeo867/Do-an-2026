import tw from '@/lib/tw'
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ExpandedState,
  type GlobalFilterTableState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table,
} from '@tanstack/react-table'
import { useDeepCompareEffect, useEventEmitter, useResetState } from 'ahooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import isEqual from 'react-fast-compare'
import { create, type StoreApi } from 'zustand'
import { MemoizedTableRowCount, TableRowCount } from './components/row-count'
import DataTable from './components/table'
import DataTablePagination from './components/table-pagination'
import TableToolbar from './components/table-toolbar'
import { ROW_ACTIONS_COLUMN_ID, ROW_EXPANSION_COLUMN_ID, ROW_SELECTION_COLUMN_ID } from './constants'
import { TableContextProvider, type TableContextStore } from './context/table.context'
import { type DataTableProps, type TableFooterProps, type ToolbarProps } from './types'
import { fuzzyFilter } from './utils/fuzzy-filter.util'
import { fuzzySort } from './utils/fuzzy-sort.util'
import { dateRangeFilter } from './utils/in-date-range-filter.util'

/**
 * @author quanghiep03198
 * @description A highly customizable and feature-rich data grid component built with React and TanStack Table. Supports sorting, filtering, pagination, row selection, column resizing, row editting and more.
 * @param {DataTableProps<object>} props - DataTableProps
 * @returns {JSX.Element} A React component that renders a data grid with various features and customization options.
 */
export const DataGrid: React.FC<DataTableProps> = ({
  data,
  caption,
  columns,
  loading,
  initialState = { rowSelection: {} },
  ref,
  containerProps,
  defaultFilterOpen = false,
  expanded = {},
  paginationProps = { enableInputPageSize: true },
  toolbarProps,
  footerProps = { hidden: true, slot: null },
  manualExpanding = false,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  enableColumnResizing = true,
  enableRowSelection = false,
  enableHiding = true,
  enableColumnFilters = true,
  enableSorting = true,
  enableExpanding = true,
  enableColumnPinning = true,
  enableGlobalFilter = true,
  enableMultiSort = true,
  globalFilterFn = 'fuzzy',
  sorting,
  columnFilters,
  globalFilter,
  virtualizerOptions,
  border = 'bottom-only',
  onGlobalFilterChange,
  onColumnFiltersChange,
  renderSubComponent,
  getRowCanExpand,
  onPaginationChange,
  onSortingChange,
  onExpandedChange,
  onRowSelectionChange,
  getRowClassName,
  ...props
}) => {
  const originalData = useMemo(() => data ?? [], [data])

  // * Table states declaration
  const [_data, setData, resetData] = useResetState(originalData)
  const [_columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [_sorting, setSorting] = useState<SortingState>([])
  const [_globalFilter, setGlobalFilter] = useState<GlobalFilterTableState['globalFilter']>('')
  const [_expanded, setExpanded] = useState<ExpandedState>({})
  const [autoResetPageIndex, setAutoResetPageIndex] = useState<boolean>(false)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialState?.rowSelection ?? {})
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([])
  const [editedRows, setEditedRows, resetEditedRows] = useResetState({})
  const [pagination, setPagination] = useState<PaginationState>(() =>
    initialState?.pagination
      ? initialState.pagination
      : {
          pageIndex: 0,
          pageSize: 50,
        }
  )

  const event$ = useEventEmitter<Record<string, unknown>>()

  // Sync external columnFilters prop vào internal _columnFilters state
  // Để table có thể apply filter client-side
  useEffect(() => {
    if (!manualFiltering && columnFilters !== undefined) {
      setColumnFilters(columnFilters)
    }
  }, [columnFilters, manualFiltering])

  const defaultColumnVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = {}
    columns.forEach((col: any) => {
      const id = col.id || col.accessorKey
      if (id && col.meta?.hidden) {
        visibility[id] = false
      }
    })
    return visibility
  }, [columns])

  // * Table declaration
  const table = useReactTable({
    data: _data,
    columns,
    initialState: {
      columnVisibility: {
        ...defaultColumnVisibility,
        ...initialState?.columnVisibility,
      },
      columnPinning: {
        left: [ROW_EXPANSION_COLUMN_ID, ROW_SELECTION_COLUMN_ID],
        right: [ROW_ACTIONS_COLUMN_ID],
      },
      expanded,
      columnOrder,
      sorting,
      globalFilter: '',
      columnFilters: [],
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
      ...initialState,
    },
    state: {
      sorting: manualSorting ? sorting : _sorting,
      columnFilters: manualFiltering ? columnFilters : _columnFilters,
      globalFilter: manualFiltering ? globalFilter : _globalFilter,
      expanded: manualExpanding ? expanded : _expanded,
      rowSelection,
      columnOrder,
      pagination: manualPagination
        ? {
            pageIndex: paginationProps?.page! - 1,
            pageSize: paginationProps?.limit!,
          }
        : pagination,
    },
    manualPagination,
    manualSorting,
    manualFiltering,
    manualExpanding,
    enableColumnFilters,
    enableSorting,
    enableExpanding,
    enableGlobalFilter,
    enableColumnPinning,
    enableColumnResizing,
    enableMultiSort,
    enableHiding,
    filterFromLeafRows: false,
    columnResizeMode: 'onChange',
    sortingFns: { fuzzy: fuzzySort },
    filterFns: {
      fuzzy: fuzzyFilter,
      inDateRange: dateRangeFilter,
    },
    globalFilterFn: globalFilterFn,
    onPaginationChange: manualPagination ? onPaginationChange : setPagination,
    onSortingChange: manualSorting ? onSortingChange : setSorting,
    onColumnFiltersChange: manualFiltering ? onColumnFiltersChange : setColumnFilters,
    onGlobalFilterChange: manualFiltering ? onGlobalFilterChange : setGlobalFilter,
    onExpandedChange: manualExpanding ? onExpandedChange : setExpanded,
    onColumnOrderChange: setColumnOrder,
    onRowSelectionChange: (updateFn) => {
      setRowSelection(updateFn)
      if (typeof onRowSelectionChange === 'function') onRowSelectionChange(updateFn)
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Khi manualFiltering=true, data đã được filter từ server → không filter thêm lần nữa
    // Nếu filter client-side trên data server-side sẽ cho kết quả sai
    ...(manualFiltering ? {} : { getFilteredRowModel: getFilteredRowModel() }),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getRowCanExpand,
    autoResetPageIndex,
    autoResetExpanded: false,
    meta: {
      editedRows,
      setEditedRows,
      updateRow: (rowIndex, columnId, value) => {
        // ? Skip page index reset until after next rerender
        setAutoResetPageIndex(false)
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              const rowValues = old[rowIndex]
              return {
                ...rowValues,
                [columnId]: value,
              }
            }
            return row
          })
        )
      },
      discardChanges: (rowIndex) => {
        if (!rowIndex) {
          resetEditedRows()
          resetData()
          return
        }
        setData((old) => old.map((row, index) => (index === rowIndex ? originalData[rowIndex] : row)))
      },
      getUnsavedChanges: () => {
        return table
          .getRowModel()
          .flatRows.filter((row) => Object.keys(editedRows).some((id) => id === row.id))
          .map((row) => row.original)
      },
    },
    ...props,
    // getSubRows: (row) => row.subRows,
  }) as Table<any>

  /**
   * * Forward table instance to ref if provided
   * * This is useful for parent components to access the table instance methods and properties
   */
  useDeepCompareEffect(() => {
    if (ref && typeof ref === 'object' && 'current' in ref) {
      ref.current = table
    }
  }, [table.getState()])

  /**
   * * Avoid infinite loop if data is empty
   *
   * @see {@link https://github.com/TanStack/table/issues/4566 | Github issue}
   */
  useDeepCompareEffect(() => {
    if (!isEqual(data, _data) && Array.isArray(data)) setData(data)
  }, [data])

  /**
   * * Emit event when all filters are cleared
   */
  useEffect(() => {
    const isAllFiltersCleared = manualFiltering
      ? columnFilters?.length === 0
      : _columnFilters?.length === 0 && _globalFilter?.length === 0

    event$.emit({ isAllFiltersCleared })
  }, [_globalFilter, _columnFilters, columnFilters])

  /**
   * * Table context store
   * * This store is used to provide the table instance and event emitter to the table context
   */
  const store = useRef<StoreApi<TableContextStore>>(null)
  if (!store.current)
    store.current = create<TableContextStore>((set) => ({
      table,
      event$,
      filterOpen: !!defaultFilterOpen,
      setFilterOpen(value) {
        set((state) => {
          return { ...state, filterOpen: value }
        })
      },
    }))

  const { isResizingColumn } = table.getState().columnSizingInfo

  return (
    <TableContextProvider value={store.current}>
      <DataTableWrapper data-border={border} suppressHydrationWarning>
        <TableToolbar {...({ ...toolbarProps, table } as unknown as ToolbarProps)} />
        <DataTable
          columns={columns.filter((col) => !col.meta?.hidden)}
          loading={loading}
          caption={caption}
          virtualizerOptions={virtualizerOptions}
          containerProps={containerProps}
          footerProps={footerProps as TableFooterProps}
          renderSubComponent={renderSubComponent}
          getRowCanExpand={getRowCanExpand}
          getRowClassName={getRowClassName}
        />
        <FooterGroup>
          {isResizingColumn ? (
            <MemoizedTableRowCount
              enableRowSelection={enableRowSelection}
              manualPagination={manualPagination}
              manualTotalDocs={paginationProps?.totalDocs ?? 0}
            />
          ) : (
            <TableRowCount
              enableRowSelection={enableRowSelection}
              manualPagination={manualPagination}
              manualTotalDocs={paginationProps?.totalDocs ?? 0}
            />
          )}
          <DataTablePagination
            table={table}
            loading={loading}
            manualPagination={manualPagination}
            controlledPaginationProps={paginationProps}
            prefetch={paginationProps.prefetch}
            enableInputPageSize={paginationProps.enableInputPageSize}
            onPaginationChange={onPaginationChange}
          />
        </FooterGroup>
      </DataTableWrapper>
    </TableContextProvider>
  )
}

const DataTableWrapper = tw.div`
	group/data-grid-wrapper space-y-2 max-w-full w-full overflow-x-hidden
	[&[data-border=bottom-only]_tr[data-role=data-grid-row]_td]:border-x-0!
	[&[data-border=bottom-only]_tr[data-role=data-grid-row]_td]:shadow-none!
	[&[data-border=bottom-only]_tr[data-role=data-grid-row]_th]:border-x-0!
	[&[data-border=bottom-only]_tr[data-role=data-grid-row]_th]:shadow-none!
`
const FooterGroup = tw.div`flex items-center justify-between`
