import { useGetPropsQuery } from '@/apis/equipment-props/hooks/use-equipment-props-request'
import type { IEquipmentProps } from '@/apis/equipment-props/types'
import { formatCurrency } from '@/common/helpers/format-intl'
import { rewriteImageUrl } from '@/common/helpers/image-url'
import { DataGrid } from '@/components/shared/data-grid'
import { ROW_ACTIONS_COLUMN_ID } from '@/components/shared/data-grid/constants'
import { fuzzySort } from '@/components/shared/data-grid/utils'
import EllipsisList from '@/components/shared/ellipsis-list'
import Image from '@/components/shared/image'
import { Badge } from '@/components/ui/badge'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { createColumnHelper } from '@tanstack/react-table'
import { format } from 'date-fns'
import React, { useMemo } from 'react'
import EquipmentPropsDropdownOptions from './equipment-props-dropdown-options'
import EquipmentPropsTableToolbar from './equipment-props-table-toolbar'
const CostumeTable: React.FC = () => {
  const { data, isLoading } = useGetPropsQuery()

  const columnHelper = createColumnHelper<IEquipmentProps>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Đạo cụ',
        size: 250,
        enableSorting: true,
        enableMultiSort: true,
        enableHiding: false,
        sortingFn: fuzzySort,
        cell: ({ row }) => {
          const propName = row.original.name
          const image = rewriteImageUrl(row.original?.images?.[0]?.dest)

          return (
            <Item size="sm" className="p-0 flex-nowrap! gap-3 group">
              <ItemMedia className="overflow-hidden rounded-lg border border-border/40 shadow-xs">
                <Image
                  src={image}
                  className="size-14 object-cover object-top transition-transform duration-300 group-hover:scale-110"
                />
              </ItemMedia>
              <ItemContent className="space-y-0.5">
                <ItemTitle className="line-clamp-1 font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                  {propName}
                </ItemTitle>
                <span className="text-[10px] text-muted-foreground font-mono">ID: #{row.original.id}</span>
              </ItemContent>
            </Item>
          )
        },
      }),

      columnHelper.accessor('category.name', {
        id: 'category.name',
        header: 'Danh mục',
        enableColumnFilter: true,
        enableGlobalFilter: true,
        size: 200,
        minSize: 150,
        filterFn: 'fuzzy',
        cell: ({ getValue }) => (
          <Badge variant="secondary" className="bg-primary/10 text-primary font-medium border-primary/20 hover:bg-primary/20 transition-all px-2.5 py-0.5">
            {getValue() as string}
          </Badge>
        )
      }),
      columnHelper.accessor('price', {
        header: 'Giá thực tế',
        enableSorting: true,
        enableMultiSort: true,
        enableHiding: false,
        size: 150,
        cell: ({ getValue }) => (
          <span className="font-semibold text-foreground font-mono">
            {formatCurrency(getValue() as number)}
          </span>
        ),
      }),
      columnHelper.accessor('rental_price_per_day', {
        header: 'Giá thuê theo ngày',
        enableSorting: true,
        enableMultiSort: true,
        enableHiding: false,
        size: 150,
        cell: ({ getValue }) => (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded">
            {formatCurrency(getValue() as number)}
          </span>
        ),
      }),
      columnHelper.accessor('unit', {
        header: 'Đơn vị',
        size: 200,
      }),

      columnHelper.accessor('hashtags', {
        header: 'Hashtag',
        size: 250,
        cell: ({ getValue }) => (
          <EllipsisList
            data={getValue()}
            threshhold={3}
            template={(item) => (
              <Badge variant="outline" className='before:content-["#"] text-[10px] text-muted-foreground hover:bg-muted border-muted/50 transition-colors'>
                {item.data}
              </Badge>
            )}
          />
        ),
      }),
      columnHelper.accessor('created_at', {
        header: 'Ngày tạo',
        size: 180,
        cell: ({ getValue }) => {
          const value = getValue()
          return value ? format(value, 'dd/MM/yyyy') : '-'
        },
      }),
      columnHelper.accessor('updated_at', {
        header: 'Cập nhật gần nhất',
        size: 180,
        cell: ({ getValue }) => {
          const value = getValue()
          return value ? format(value, 'dd/MM/yyyy') : '-'
        },
      }),
      columnHelper.display({
        id: ROW_ACTIONS_COLUMN_ID,
        header: '',
        size: 60,
        enableHiding: false,
        cell: EquipmentPropsDropdownOptions,
      }),
    ],
    []
  )

  return (
    <DataGrid
      data={data}
      columns={columns}
      loading={isLoading}
      virtualizerOptions={{ estimateSize: 80 }}
      manualSorting={false}
      enableSorting={true}
      manualFiltering={false}
      enableColumnFilters={true}
      enableMultiSort={true}
      isMultiSortEvent={() => true}
      containerProps={{
        className:
          'xxl:h-[calc(var(--outlet-wrapper-height)-3rem)] h-96 md:max-xxl:h-[calc(var(--outlet-wrapper-height)-8rem)]',
      }}
      toolbarProps={{
        override: true,
        render: EquipmentPropsTableToolbar,
      }}
    />
  )
}

export default CostumeTable
