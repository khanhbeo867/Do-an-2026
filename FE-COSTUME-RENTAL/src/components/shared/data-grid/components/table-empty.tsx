import { Icon } from '@/components/ui/icon'
import { TableBody, TableCell, TableRow } from '@/components/ui/table'
import React from 'react'
import { useTableContext } from '../context/table.context'

const DataTableEmpty: React.FC = () => {
  const { table, filterOpen } = useTableContext('table', 'filterOpen')

  return (
    <TableBody
      className={
        filterOpen ? 'h-[calc(100cqh-2*var(--header-row-height)-2px)]' : 'h-[calc(100cqh-var(--header-row-height)-1px)]'
      }
    >
      <TableRow>
        <TableCell colSpan={table.getAllColumns().length} className="p-0">
          <div className="text-muted-foreground sticky top-0 left-0 flex w-[100cqw] items-center justify-center gap-x-2">
            <Icon name="Database" />
            No data
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  )
}

export default DataTableEmpty
