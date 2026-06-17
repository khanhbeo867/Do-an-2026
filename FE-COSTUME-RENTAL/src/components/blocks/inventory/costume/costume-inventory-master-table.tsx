import { COSTUME_GENDER_LABEL_MAP, COSTUME_UNIT_LABEL_MAP, SIZE_RUN } from '@/apis/costume/constants'
import { useGetCostumeInventoryQuery } from '@/apis/inventory/hooks/use-inventory-request'
import type { ICostumeInventory } from '@/apis/inventory/types/costume'
import { GENDER_ICONS } from '@/assets/svg/gender-icons'
import { formatCurrency } from '@/common/helpers/format-intl'
import { rewriteImageUrl } from '@/common/helpers/image-url'
import { DataGrid } from '@/components/shared/data-grid'
import { ROW_EXPANSION_COLUMN_ID } from '@/components/shared/data-grid/constants'
import type { RenderSubComponentProps } from '@/components/shared/data-grid/types'
import { fuzzySort } from '@/components/shared/data-grid/utils'
import Image from '@/components/shared/image'
import { Tooltip } from '@/components/shared/tooltip'
import { Badge } from '@/components/ui/badge'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { createColumnHelper } from '@tanstack/react-table'
import { ChevronDownIcon, ChevronRightIcon, ListCollapseIcon, PackageCheckIcon, PackageXIcon } from 'lucide-react'
import React, { useCallback, useMemo } from 'react'
import CostumeInventoryDetailTable from './costume-inventory-detail-table'
import CostumeInventoryTableToolbar from './costume-inventory-table-toolbar'

const CostumeInventoryMasterTable: React.FC = () => {
  const { data, isLoading } = useGetCostumeInventoryQuery()

  const columnHelper = createColumnHelper<ICostumeInventory>()

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
        header: 'Trang phục',
        minSize: 250,
        enableSorting: true,
        enableMultiSort: true,
        enableHiding: false,
        sortingFn: fuzzySort,
        cell: ({ row }) => {
          const costumeName = row.original.name
          const image = rewriteImageUrl(row.original.images[0]?.dest)
          const color = row.original.color
          return (
            <Item size="sm" className="p-0 flex-nowrap">
              <ItemMedia>
                <Image src={image} className="size-14 rounded" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="line-clamp-1">{costumeName}</ItemTitle>
                <div className="inline-flex items-center gap-x-2">
                  <ItemDescription>Màu sắc:</ItemDescription>
                  <div style={{ backgroundColor: color.hex }} className="size-4 rounded-full" />
                </div>
              </ItemContent>
            </Item>
          )
        },
      }),
      columnHelper.accessor('in_stock', {
        id: 'in_stock',
        header: 'Tình trạng',
        size: 150,
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
      columnHelper.accessor('category.id', {
        id: 'category.id',
        header: 'Danh mục',
        size: 200,

        enableColumnFilter: true,
        enableGlobalFilter: false,
        enableResizing: true,
        filterFn: 'arrIncludesSome',
        cell: ({ row }) => row.original.category.name,
      }),
      columnHelper.accessor('gender', {
        header: 'Giới tính',
        size: 100,
        cell: ({ getValue }) => {
          const value = getValue()
          const gender = COSTUME_GENDER_LABEL_MAP.get(value)
          const GenderIcon = GENDER_ICONS.get(value)!
          return (
            <Badge>
              <GenderIcon className="font-medium size-4" />
              {gender}
            </Badge>
          )
        },
      }),
      columnHelper.accessor('rental_price_per_day', {
        header: 'Giá thuê gốc',
        enableSorting: true,
        enableColumnFilter: false,
        enableGlobalFilter: false,
        size: 200,
        cell: ({ getValue }) => formatCurrency(getValue()) + ' / ngày',
      }),
      columnHelper.display({
        id: 'total_qty',
        header: 'Tổng số lượng',
        cell: ({ row }) => {
          const items = row.original.details
          const totalQty = items.length
          return totalQty
        },
      }),
      columnHelper.accessor('unit', {
        header: 'Đơn vị',
        size: 100,
        cell: ({ getValue }) => COSTUME_UNIT_LABEL_MAP.get(getValue()),
      }),
    ],
    []
  )

  const renderSubComponent = useCallback(({ row }: RenderSubComponentProps<ICostumeInventory>) => {
    const data = {
      items: row.original.details.sort(
        (a, b) =>
          SIZE_RUN.findIndex((size) => size.value === a.size) - SIZE_RUN.findIndex((size) => size.value === b.size)
      ),
      summary: row.original.sizes.map((size) => ({
        size: size,
        qty: row.original.details.filter((item) => item.size === size).length,
      })),
    }

    return <CostumeInventoryDetailTable data={data} />
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
          'xxl:h-[calc(var(--outlet-wrapper-height)-2rem)] h-96 md:max-xxl:h-[calc(var(--outlet-wrapper-height)-8rem)]',
      }}
      toolbarProps={{
        override: true,
        render: CostumeInventoryTableToolbar,
      }}
      renderSubComponent={renderSubComponent}
    />
  )
}

export default CostumeInventoryMasterTable
