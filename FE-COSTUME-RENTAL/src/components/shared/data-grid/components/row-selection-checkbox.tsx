import type { CellContext, HeaderContext, RowSelectionState, TableState } from '@tanstack/react-table'
import { useUpdate } from 'ahooks'
import { pick } from 'lodash-es'
import React, { useEffect } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { useTableContext } from '../context/table.context'

type IndeterminateCheckboxProps = HeaderContext<any, unknown> & React.ComponentProps<typeof Checkbox>

type RowSelectionCheckboxProps = CellContext<any, unknown> & React.ComponentProps<typeof Checkbox>

export const IndeterminateCheckbox: React.FC<IndeterminateCheckboxProps> = ({ table, onCheckedChange, ...props }) => {
  const { event$ } = useTableContext('table', 'event$')
  const rerender = useUpdate()

  event$.useSubscription((value: { rowSelection?: RowSelectionState }) => {
    if (typeof value.rowSelection === 'object') {
      rerender()
    }
  })

  const handleCheckedChange = (checked: boolean) => {
    table.toggleAllRowsSelected(Boolean(checked))
    if (typeof checked === 'boolean') event$.emit(pick(table.getState(), ['rowSelection']))
    if (typeof onCheckedChange === 'function' && typeof checked === 'boolean')
      onCheckedChange(checked, { reason: 'none' })
  }

  return (
    <Checkbox
      {...props}
      checked={
        (table.getIsAllRowsSelected() ||
          (table.getIsSomeRowsSelected() &&
            table.getFilteredSelectedRowModel().flatRows.length > 0 &&
            'indeterminate')) as boolean
      }
      onCheckedChange={handleCheckedChange}
    />
  )
}

IndeterminateCheckbox.displayName = 'IndeterminateCheckbox'

export const RowSelectionCheckbox: React.FC<RowSelectionCheckboxProps> = ({ row, disabled, onCheckedChange }) => {
  const { table, event$ } = useTableContext('table', 'event$')
  const rerender = useUpdate()

  useEffect(() => {
    event$.emit(pick(table.getState(), ['rowSelection']))
  }, [row.getIsSelected()])

  event$.useSubscription((value: Partial<Pick<TableState, 'rowSelection'>>) => {
    if (typeof value.rowSelection === 'object') rerender()
  })

  const handleCheckedChange = (checked: boolean) => {
    row.toggleSelected(Boolean(checked))
    if (typeof onCheckedChange === 'function')
      onCheckedChange(checked, {
        reason: 'none',
        event: undefined,
        cancel: function (): void {
          throw new Error('Function not implemented.')
        },
        allowPropagation: function (): void {
          throw new Error('Function not implemented.')
        },
        isCanceled: false,
        isPropagationAllowed: false,
        trigger: undefined,
      })
  }

  return <Checkbox disabled={disabled} checked={row.getIsSelected()} onCheckedChange={handleCheckedChange} />
}

RowSelectionCheckbox.displayName = 'RowSelectionCheckbox'
