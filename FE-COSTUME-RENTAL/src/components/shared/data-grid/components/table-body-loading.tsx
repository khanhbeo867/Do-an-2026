import { Skeleton } from '@/components/ui/skeleton'
import { TableBody, TableCell, TableRow } from '@/components/ui/table'
import { useTableContext } from '../context/table.context'
import { getStickyOffsetPosition } from '../utils'

const DataTableBodyLoading: React.FC = () => {
  const { table } = useTableContext('table')

  const preRenderRows = Array.from(new Array(10), (_, index) => index)
  const preRenderColumns = table.getAllLeafColumns()

  return (
    <TableBody>
      {preRenderRows.map((rowIndex) => (
        <TableRow key={rowIndex} data-role="data-grid-row">
          {preRenderColumns.map((column, columnIndex) => {
            return (
              <TableCell
                key={`${rowIndex}-${columnIndex}`}
                style={{
                  ...getStickyOffsetPosition(column),
                  width: `var(--column-${column?.id}-size)`,
                  height: 'var(--row-height)',
                }}
              >
                <Skeleton className="h-[calc(var(--row-height)/4)]" />
              </TableCell>
            )
          })}
        </TableRow>
      ))}
    </TableBody>
  )
}

export default DataTableBodyLoading
