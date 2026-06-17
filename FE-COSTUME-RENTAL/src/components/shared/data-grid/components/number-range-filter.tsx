import { DebouncedInput } from '@/components/shared/debounced-input'
import { Separator } from '@/components/ui/separator'
import { type Column } from '@tanstack/react-table'
import { useState } from 'react'
import { useTableContext } from '../context/table.context'

export type NumberRangeFilterProps = { column: Column<any, any> }

export const NumberRangeFilter: React.FC<NumberRangeFilterProps> = ({ column }) => {
  const [isAllFiltersCleared, setIsAllFiltersCleared] = useState<boolean>(true)
  const { event$ } = useTableContext('event$')

  event$.useSubscription((value: { isAllFiltersCleared?: boolean }) => {
    if (typeof value.isAllFiltersCleared === 'boolean') setIsAllFiltersCleared(value.isAllFiltersCleared)
  })

  return (
    <div className="flex items-center">
      <DebouncedInput
        type="number"
        tabIndex={0}
        className="placeholder:text-muted-foreground/80 hover:text-foreground rounded-none border-none px-3 text-xs shadow-none placeholder:text-xs"
        min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
        max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
        value={(isAllFiltersCleared ? '' : (column.getFilterValue() as [number, number]))?.[0] ?? ''}
        onChange={(value) => column.setFilterValue((old: [number, number]) => [value, old?.[1]])}
        placeholder={`Min ${column.getFacetedMinMaxValues()?.[0] ? `(${column.getFacetedMinMaxValues()?.[0]})` : ''}`}
      />
      <Separator orientation="vertical" className="h-6 w-1" />
      <DebouncedInput
        type="number"
        tabIndex={0}
        className="placeholder:text-muted-foreground/80 hover:text-foreground rounded-none border-none px-3 text-xs shadow-none placeholder:text-xs"
        min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
        max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
        value={(isAllFiltersCleared ? '' : (column.getFilterValue() as [number, number]))?.[1] ?? ''}
        onChange={(value) => column.setFilterValue((old: [number, number]) => [old?.[0], value])}
        placeholder={`Max ${column.getFacetedMinMaxValues()?.[1] ? `(${column.getFacetedMinMaxValues()?.[1]})` : ''}`}
      />
    </div>
  )
}
