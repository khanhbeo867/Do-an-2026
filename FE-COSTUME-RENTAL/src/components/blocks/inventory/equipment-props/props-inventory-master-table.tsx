import { useGetPropsInventoryQuery } from '@/apis/inventory/hooks/use-inventory-request'
import type { IEquipmentPropsInventory } from '@/apis/inventory/types/equipment-props'
import { formatCurrency } from '@/common/helpers/format-intl'
import { DataGrid } from '@/components/shared/data-grid'
import { ROW_EXPANSION_COLUMN_ID } from '@/components/shared/data-grid/constants'
import { fuzzySort } from '@/components/shared/data-grid/utils'
import Image from '@/components/shared/image'
import { Tooltip } from '@/components/shared/tooltip'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { createColumnHelper } from '@tanstack/react-table'
import { ChevronDownIcon, ChevronRightIcon, ListCollapseIcon, PackageCheckIcon, PackageXIcon } from 'lucide-react'
import React, { useCallback, useMemo } from 'react'

import { rewriteImageUrl } from '@/common/helpers/image-url'
import type { RenderSubComponentProps } from '@/components/shared/data-grid/types'
import { Badge } from '@/components/ui/badge'
import PropsInventoryDetailTable from './props-inventory-detail-table'
import PropsInventoryTableToolbar from './props-inventory-table-toolbar'

const PropsInventoryMasterTable: React.FC = () => {
  const { data, isLoading } = useGetPropsInventoryQuery()

  const columnHelper = createColumnHelper<IEquipmentPropsInventory>()

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: ROW_EXPANSION_COLUMN_ID,
        header: ({ table }) => (
          <Tooltip
            message="Thu gọn"
            triggerProps={{
              render: (
                <button
                  className="absolute inset-0 flex h-full w-full items-center justify-center text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  onClick={() => table.toggleAllRowsExpanded(false)}
                >
                  <ListCollapseIcon size={16} />
                </button>
              ),
            }}
          />
        ),
        size: 50,
        maxSize: 50,
        enableHiding: false,
        cell: ({ row, table }) => (
          <button
            className="absolute inset-0 flex h-full w-full items-center justify-center"
            onClick={() => {
              table.toggleAllRowsExpanded(false)
              row.toggleExpanded(!row.getIsExpanded())
            }}
          >
            {row.getIsExpanded() ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
          </button>
        ),
      }),
      columnHelper.accessor('name', {
        header: 'Đạo cụ',
        minSize: 250,
        enableSorting: true,
        enableMultiSort: true,
        enableHiding: false,
        sortingFn: fuzzySort,
        cell: ({ row }) => {
          const costumeName = row.original.name
          const image = rewriteImageUrl(row.original.images?.[0]?.dest)

          return (
            <Item size="sm" className="p-0 flex-nowrap">
              <ItemMedia>
                <Image src={image} className="size-16 rounded" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="line-clamp-1">{costumeName}</ItemTitle>
              </ItemContent>
            </Item>
          )
        },
      }),
      columnHelper.accessor('category.id', {
        id: 'category.id',
        header: 'Danh mục',
        size: 200,
        maxSize: 200,
        enableColumnFilter: true,
        enableGlobalFilter: false,
        enableResizing: true,
        filterFn: 'arrIncludesSome',
        cell: ({ row }) => row.original.category.name,
      }),
      columnHelper.accessor('in_stock', {
        id: 'in_stock',
        header: 'Tình trạng',
        size: 150,
        maxSize: 200,
        enableColumnFilter: true,
        enableGlobalFilter: false,
        enableResizing: true,
        filterFn: 'arrIncludesSome',
        cell: ({ getValue }) => {
          const isInStock = getValue()

          return (
            <Badge variant={isInStock ? 'outline' : 'destructive'}>
              {isInStock ? <PackageCheckIcon /> : <PackageXIcon />}
              {isInStock ? 'Còn hàng' : 'Hết hàng'}
            </Badge>
          )
        },
      }),

      columnHelper.accessor('rental_price_per_day', {
        header: 'Giá thuê hiện tại',
        enableSorting: true,
        enableColumnFilter: false,
        enableGlobalFilter: false,
        size: 200,
        maxSize: 200,
        cell: ({ getValue }) => formatCurrency(getValue()) + ' / ngày',
      }),

      columnHelper.display({
        id: 'total_qty',
        header: 'Tổng số lượng',
        size: 150,
        cell: ({ row }) => {
          const items = row.original.details
          const totalQty = items.length
          return totalQty
        },
      }),

      columnHelper.accessor('unit', {
        header: 'Đơn vị',
        size: 100,
      }),
    ],
    []
  )

  const renderSubComponent = useCallback(({ row }: RenderSubComponentProps<IEquipmentPropsInventory>) => {
    const data = row.original.details.sort((a, b) =>
      a.sku.localeCompare(b.sku, undefined, { numeric: true, sensitivity: 'base' })
    )

    return <PropsInventoryDetailTable data={data} />
  }, [])

  return (
    <DataGrid
      columns={columns}
      data={data ?? []}
      loading={isLoading}
      virtualizerOptions={{ estimateSize: 80 }}
      enableExpanding
      containerProps={{
        className:
          'xxl:h-[calc(var(--outlet-wrapper-height)-2rem)] h-96 md:max-xxl:h-[calc(var(--outlet-wrapper-height)-8rem)] [&>table]:table-fixed',
      }}
      toolbarProps={{
        override: true,
        render: PropsInventoryTableToolbar,
      }}
      renderSubComponent={renderSubComponent}
    />
  )
}

export default PropsInventoryMasterTable
