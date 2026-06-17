import { DebouncedInput, type DebouncedInputProps } from '@/components/shared/debounced-input'
import { DropdownSelect } from '@/components/shared/dropdown-select'
import { type Column } from '@tanstack/react-table'
import { useUpdate } from 'ahooks'
import { pick } from 'lodash-es'
import { useEffect, useState } from 'react'
import { DEFAULT_ESTIMATE_SIZE } from '../constants'
import { useTableContext } from '../context/table.context'
import MultiSelectColumnFilter from './multi-select-column-filter'
import { NumberRangeFilter } from './number-range-filter'

type ColumnFilterProps<TData, TValue> = {
  column: Column<TData, TValue>
}

export function TableColumnFilter<TData, TValue>({ column }: ColumnFilterProps<TData, TValue>) {
  const filterVariant = column.columnDef.meta?.filterVariant
  const columnFilterValue = column.getFilterValue()
  const [isAllFiltersCleared, setIsAllFiltersCleared] = useState(true)
  const { table, event$ } = useTableContext('table', 'event$')
  const rerender = useUpdate()

  event$.useSubscription((value) => {
    if (typeof value.isAllFiltersCleared === 'boolean') setIsAllFiltersCleared(value.isAllFiltersCleared)
  })

  const getFacetedUniqueValues = () => {
    try {
      return column.getFacetedUniqueValues()
    } catch {
      return new Map()
    }
  }

  const getSortedUniqueValues = () => {
    const facetedUniqueValues = getFacetedUniqueValues()
    const uniqueValues = Array.from(facetedUniqueValues?.keys())
    uniqueValues.sort((a, b) => {
      if (a === b) return 0
      return a > b ? 1 : -1
    })
    return uniqueValues
  }

  useEffect(() => {
    event$.emit(pick(table.getState(), ['rowSelection']))
  }, [columnFilterValue])

  // * Useful for server side filtering
  const metaUniqueValues = column.columnDef.meta?.facetedUniqueValues
  if (!column.columnDef.enableColumnFilter)
    return (
      <div className="text-muted-foreground/50 flex h-full items-center justify-center px-2 text-xs font-medium select-none">
        -
      </div>
    )

  switch (filterVariant) {
    case 'range': {
      return <NumberRangeFilter column={column} />
    }
    // case 'date': {
    // 	const date = columnFilterValue as DateRange | undefined

    // 	return (
    // 		<DateRangePicker
    // 			triggerProps={{
    // 				className: 'border-none shadow-none hover:bg-background flex text-xs! font-medium'
    // 			}}
    // 			calendarProps={{
    // 				defaultMonth: date?.from ?? new Date(),
    // 				numberOfMonths: 1,
    // 				selected: date,
    // 				onSelect: (value) => {
    // 					column.setFilterValue(value)
    // 					rerender()
    // 				}
    // 			}}
    // 		/>
    // 	)
    // }
    case 'select': {
      return (
        <DropdownSelect
          selectTriggerProps={{
            className:
              'min-w-32 px-4 rounded-none border-none text-xs font-medium text-muted-foreground ring-0 focus:ring-0 outline-none shadow-none hover:text-foreground focus:border-none',
            tabIndex: 0,
            style: { height: DEFAULT_ESTIMATE_SIZE },
          }}
          selectProps={{
            value: isAllFiltersCleared ? '' : (column.getFilterValue() as string),
            onValueChange: (value) => {
              column.setFilterValue(value)
            },
          }}
          placeholder="Chọn giá trị"
          datalist={
            Array.isArray(metaUniqueValues)
              ? metaUniqueValues
              : getSortedUniqueValues()
                  .filter((value) => Boolean(value))
                  .map((value: any) => ({
                    label: value,
                    value: value,
                  }))
          }
          labelField="label"
          valueField="value"
        />
      )
    }

    case 'multi-select': {
      return (
        <MultiSelectColumnFilter
          value={(columnFilterValue ?? []) as string[]}
          onValueChange={(value) => {
            column.setFilterValue(value)
          }}
          datalist={
            Array.isArray(metaUniqueValues)
              ? metaUniqueValues
              : getSortedUniqueValues()
                  .filter((value) => Boolean(value))
                  .map((value: any) => ({
                    label: value,
                    value: value,
                  }))
          }
        />
      )
    }

    default: {
      return (
        <DebouncedInput
          id={column.id}
          value={(isAllFiltersCleared ? '' : (columnFilterValue as DebouncedInputProps['value'])) ?? ''}
          placeholder="Nhập giá trị..."
          onChange={(value) => column.setFilterValue(value)}
        />
      )
    }
  }
}
