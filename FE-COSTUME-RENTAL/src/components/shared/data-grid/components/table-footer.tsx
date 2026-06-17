import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Fragment, memo } from 'react'
import { useTableContext } from '../context/table.context'
import { type TableFooterProps } from '../types'

function TableFooter({ hidden, slot: Slot, rtl }: TableFooterProps) {
  const { table } = useTableContext('table')
  if (hidden || !Slot) return null

  return (
    <Fragment>
      <Separator />
      <div className={cn('bg-background flex items-center gap-x-1', rtl ? 'justify-start' : 'justify-end')}>
        <Slot table={table} />
      </div>
    </Fragment>
  )
}

export default memo(TableFooter)
