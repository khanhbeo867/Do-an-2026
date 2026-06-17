import { GET_PROPS_CATEGORY_QUERY_KEY, useGetCategoriesQuery } from '@/apis/category/hooks/use-category-request'
import type { IEquipmentProps } from '@/apis/equipment-props/types'
import { useGetPropsQuery } from '@/apis/equipment-props/hooks/use-equipment-props-request'
import { ColumnViewOptions } from '@/components/shared/data-grid/components/column-view-options'
import GlobalFilterInput from '@/components/shared/data-grid/components/global-filter-input'
import { DataTableFacetedFilter } from '@/components/shared/data-grid/components/table-faceted-filter'
import { Button } from '@/components/ui/button'
import type { Table } from '@tanstack/react-table'
import { RefreshCw } from 'lucide-react'
import React, { useMemo } from 'react'

const EquipmentPropsTableToolbar: React.FC<{ table: Table<IEquipmentProps> }> = ({ table }) => {
  const { refetch, isRefetching } = useGetPropsQuery()

  const { data: categories } = useGetCategoriesQuery(GET_PROPS_CATEGORY_QUERY_KEY)

  const categoryOptions = useMemo(() => {
    return !Array.isArray(categories) ? [] : categories.map((cate) => ({ label: cate.name, value: cate.name }))
  }, [categories])

  return (
    <div className="flex flex-wrap gap-2.5 items-center justify-between w-full bg-card/60 backdrop-blur-xs p-1.5 rounded-lg border border-border/20 shadow-xs">
      <div className="flex flex-wrap gap-2 items-center">
        <GlobalFilterInput table={table} className="h-9 w-60 bg-background" />
        <DataTableFacetedFilter column={table.getColumn('category.name')} title="Danh mục" options={categoryOptions} />
      </div>
      <div className="flex gap-2 items-center">
        <ColumnViewOptions />
        <Button variant="outline" size="sm" className="h-9 cursor-pointer gap-1.5 hover:bg-muted" disabled={isRefetching} onClick={() => refetch()}>
          <RefreshCw size={14} aria-current={isRefetching} className={'aria-current:animate-spin'} /> Tải lại
        </Button>
      </div>
    </div>
  )
}

export default EquipmentPropsTableToolbar
