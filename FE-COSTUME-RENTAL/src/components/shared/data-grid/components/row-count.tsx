import { Typography } from '@/components/ui/typography'
import { type Row } from '@tanstack/react-table'
import { memo } from 'react'
import { useTableContext } from '../context/table.context'

export type DataTableRowCountProps = {
  enableRowSelection: boolean | ((row: Row<any>) => boolean)
  manualPagination: boolean
  manualTotalDocs: number
}

const TableRowCount: React.FC<DataTableRowCountProps> = ({ enableRowSelection, manualPagination, manualTotalDocs }) => {
  const { table } = useTableContext('table')

  const selectedRows = table.getFilteredSelectedRowModel()?.rows?.length
  const totalRows = manualPagination ? manualTotalDocs : (table.getFilteredRowModel()?.rows?.length ?? 0)
  const rowSelectionCount = String(selectedRows) + '/' + String(totalRows)

  return enableRowSelection ? (
    <Typography className="text-sm font-medium sm:hidden">{`Đã chọn ${rowSelectionCount} hàng`}</Typography>
  ) : (
    <Typography className="text-sm font-medium sm:hidden">{`Tổng ${totalRows} hàng`}</Typography>
  )
}

const MemoizedTableRowCount = memo(TableRowCount) as typeof TableRowCount

export { MemoizedTableRowCount, TableRowCount }
