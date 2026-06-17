import { useGetCategoriesQuery } from '@/apis/category/hooks/use-category-request'
import { useGetPropsInventoryQuery } from '@/apis/inventory/hooks/use-inventory-request'
import type { ICostumeInventory } from '@/apis/inventory/types/costume'
import { ItemType } from '@/common/constants/enums'
import { ColumnViewOptions } from '@/components/shared/data-grid/components/column-view-options'
import GlobalFilterInput from '@/components/shared/data-grid/components/global-filter-input'
import { DataTableFacetedFilter } from '@/components/shared/data-grid/components/table-faceted-filter'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Table } from '@tanstack/react-table'
import { RefreshCcwIcon, XIcon } from 'lucide-react'
import React, { Activity, useMemo } from 'react'
import ImportInventoryFormDialog from '../import-inventory-form-dialog'

const PropsInventoryTableToolbar: React.FC<{ table: Table<ICostumeInventory> }> = ({ table }) => {
  const { refetch, isFetching } = useGetPropsInventoryQuery()

  return (
    <div className="flex items-center gap-2">
      <GlobalFilterInput table={table} />
      <CategoryFilter table={table} />
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

      <Button variant="outline" className="ml-auto" onClick={() => refetch()} disabled={isFetching}>
        <RefreshCcwIcon aria-busy={isFetching} className="aria-busy:animate-spin" /> Tải lại
      </Button>
      <ColumnViewOptions />
      <Separator orientation="vertical" />
      <ImportInventoryFormDialog type={ItemType.EQUIPMENT_PROPS} />
    </div>
  )
}

const CategoryFilter: React.FC<{ table: Table<ICostumeInventory> }> = ({ table }) => {
  const { data } = useGetCategoriesQuery({ 'type:eq': ItemType.COSTUME })

  const inventoryConditionOptions = useMemo(() => {
    if (!Array.isArray(data)) return []
    return data.map((category) => ({
      label: category.name,
      value: category.id,
    }))
  }, [])

  return (
    <DataTableFacetedFilter
      title="Danh mục"
      icon="NotepadText"
      column={table.getColumn('category.id')}
      options={inventoryConditionOptions}
    />
  )
}

export default PropsInventoryTableToolbar
