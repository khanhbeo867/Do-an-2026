import { DropdownSelectProps, MultiSelectProps, TableCell } from '@/components/ui'
import { DateRangePickerProps } from '@/components/ui/@core/date-range-picker'
import { DebouncedInputProps } from '@/components/ui/@custom/debounced-input'
import { NumberRangeFilterProps } from '@/components/ui/@react-table/components/number-range-filter'
import '@tanstack/react-table'
import { Row, RowData } from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  type FilterComponentProps = {
    ['text']?: DebouncedInputProps<any>
    ['range']?: NumberRangeFilterProps<any>
    ['select']?: DropdownSelectProps<any>
    ['date']?: DateRangePickerProps<any>
    ['multi-select']?: MultiSelectProps<any>
  }

  export type ColumnFilterVariant = 'text' | 'range' | 'select' | 'date' | 'multi-select' | 'autocomplete'

  interface ColumnMeta {
    facetedUniqueValues?: Array<Record<'label' | 'value', any>>
    filterVariant?: ColumnFilterVariant
    filterComponentProps?: FilterComponentProps[FilterComponentProps]
    title?: string
    hidden?: boolean
    sticky?: 'left' | 'right'
    rowSpan?: number
    align?: 'left' | 'center' | 'right'
    cellDataType?: 'text' | 'number' | 'date' | 'boolean'
    tableCellProps?: React.ComponentProps<typeof TableCell>
    validate?: (value: any) => boolean
  }

  interface ColumnMetaWithFilterProps<
    TData extends RowData,
    TValue,
    Variant extends ColumnFilterVariant,
  > extends ColumnMeta<TData, TValue> {
    filterComponentProps?: Partial<FilterComponentProps[Variant]>
  }

  interface TableMeta<TData extends RowData> {
    editedRows: Record<Row<TData>['id'], boolean>
    setEditedRows: React.Dispatch<React.SetStateAction<Record<Row<TData>['id'], boolean>>>
    updateRow: (rowIndex: number, columnId: string, value: unknown) => void
    discardChanges: (rowIndex?: number) => void
    getUnsavedChanges: () => TData[]
  }

  //add fuzzy filter to the filterFns
  interface FilterFns {
    fuzzy?: FilterFn<unknown>
    inDateRange?: FilterFn<any>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}
