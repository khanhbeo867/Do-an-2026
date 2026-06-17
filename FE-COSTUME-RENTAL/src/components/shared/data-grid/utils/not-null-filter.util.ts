import { FilterFn } from '@tanstack/react-table'
import { isNil } from 'lodash-es'

export const notNullFilter: FilterFn<any> = (row, columnId) => {
  const value = row.getValue(columnId)
  return !isNil(value) // Include if not null or undefined
}
