import { isServer } from '@/lib/utils'
import type { FilterFn } from '@tanstack/react-table'
import { isWithinInterval } from 'date-fns'
import type { DateRange } from 'react-day-picker'

export const dateRangeFilter: FilterFn<DateRange> = (row, columnId, filterValue: DateRange) => {
  if (isServer) return true
  return isWithinInterval(row.getValue(columnId), {
    start: filterValue?.from!,
    end: filterValue?.to!,
  })
}
