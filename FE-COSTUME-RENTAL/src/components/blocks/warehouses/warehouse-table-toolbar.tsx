import { useGetWarehouseQuery } from '@/apis/warehouse/hooks/use-warehouse-request'
import type { IWarehouse } from '@/apis/warehouse/types'
import GlobalFilterInput from '@/components/shared/data-grid/components/global-filter-input'
import { DataTableFacetedFilter } from '@/components/shared/data-grid/components/table-faceted-filter'
import { Button } from '@/components/ui/button'
import type { Table } from '@tanstack/react-table'
import { CircleFadingPlusIcon, RefreshCcw, XIcon } from 'lucide-react'
import { Activity } from 'react'
import { usePubSub } from '.'
import { WAREHOUSE_TYPE_OPTIONS } from './constant'

const WarehouseTableToolbar: React.FC<{ table: Table<IWarehouse> }> = ({ table }) => {
  const { refetch } = useGetWarehouseQuery()
  const { publish } = usePubSub()

  return (
    <div className="flex items-center gap-1">
      <GlobalFilterInput table={table} />
      <DataTableFacetedFilter column={table.getColumn('type')} title="Loại kho" options={WAREHOUSE_TYPE_OPTIONS} />
      <Activity
        mode={table.getState().globalFilter || table.getState().columnFilters.length > 0 ? 'visible' : 'hidden'}
      >
        <Button
          variant="secondary"
          onClick={() => {
            table.resetGlobalFilter()
            table.resetColumnFilters()
          }}
        >
          <XIcon /> Xóa lọc
        </Button>
      </Activity>
      <Button variant="outline" className="ml-auto" onClick={() => refetch()}>
        <RefreshCcw /> Tải lại
      </Button>
      <Button onClick={() => publish('warehouse:create', null)}>
        <CircleFadingPlusIcon /> Thêm kho mới
      </Button>
    </div>
  )
}

export default WarehouseTableToolbar
