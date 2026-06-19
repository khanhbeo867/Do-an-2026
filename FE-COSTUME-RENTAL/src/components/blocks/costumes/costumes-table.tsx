import { COSTUME_GENDER_LABEL_MAP, COSTUME_UNIT_LABEL_MAP } from '@/apis/costume/constants'
import { useGetCostumesQuery } from '@/apis/costume/hooks/use-costume-request'
import type { ICostume } from '@/apis/costume/types'
import { GENDER_ICONS } from '@/assets/svg/gender-icons'
import { formatCurrency } from '@/common/helpers/format-intl'
import { rewriteImageUrl } from '@/common/helpers/image-url'
import { DataGrid } from '@/components/shared/data-grid'
import { ROW_ACTIONS_COLUMN_ID } from '@/components/shared/data-grid/constants'
import { fuzzySort } from '@/components/shared/data-grid/utils'
import EllipsisList from '@/components/shared/ellipsis-list'
import Image from '@/components/shared/image'
import { Badge } from '@/components/ui/badge'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { createColumnHelper } from '@tanstack/react-table'
import React, { useMemo } from 'react'
import CostumeDropdownOptions from './costume-dropdown-options'
import CostumeTableToolbar from './costume-table-toolbar'

const CostumeTable: React.FC = () => {
  const { data, isLoading } = useGetCostumesQuery()

  const columnHelper = createColumnHelper<ICostume>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Trang phục',
        size: 250,
        enableSorting: true,
        enableMultiSort: true,
        enableHiding: false,
        sortingFn: fuzzySort,
        cell: ({ row }) => {
          const costumeName = row.original.name
          const image = rewriteImageUrl(row.original.images[0]?.dest)
          const color = row.original.color
          return (
            <Item size="sm" className="p-0 flex-nowrap!">
              <ItemMedia>
                <Image src={image} className="size-16 rounded" />
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

      columnHelper.accessor('category.name', {
        id: 'category.name',
        header: 'Danh mục',
        enableColumnFilter: true,
        enableGlobalFilter: true,
        filterFn: 'fuzzy',
      }),
      columnHelper.accessor('price', {
        header: 'Giá thực tế',
        cell: ({ getValue }) => formatCurrency(getValue()),
      }),
      columnHelper.accessor('rental_price_per_day', {
        header: 'Giá thuê theo ngày',
        cell: ({ getValue }) => formatCurrency(getValue()),
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
              <GenderIcon className="font-medium" />
              {gender}
            </Badge>
          )
        },
      }),
      columnHelper.accessor('unit', {
        header: 'Đơn vị',
        size: 100,
        cell: ({ getValue }) => COSTUME_UNIT_LABEL_MAP.get(getValue()),
      }),
      columnHelper.accessor('sizes', {
        header: 'Cỡ',
        cell: ({ getValue }) => (
          <EllipsisList
            data={getValue()}
            threshhold={2}
            template={(item) => <Badge variant="outline">{item.data}</Badge>}
          />
        ),
      }),
      columnHelper.accessor('hashtags', {
        header: 'Hashtag',
        cell: ({ getValue }) => (
          <EllipsisList
            data={getValue()}
            threshhold={1}
            template={(item) => (
              <Badge variant="outline" className='before:content-["#"]'>
                {item.data}
              </Badge>
            )}
          />
        ),
      }),
      columnHelper.display({
        id: ROW_ACTIONS_COLUMN_ID,
        header: '',
        size: 60,
        cell: CostumeDropdownOptions,
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
      containerProps={{
        className:
          'xxl:h-[calc(var(--outlet-wrapper-height)-4rem)] h-96 md:max-xxl:h-[calc(var(--outlet-wrapper-height)-9rem)]',
      }}
      toolbarProps={{
        override: true,
        render: CostumeTableToolbar,
      }}
    />
  )
}

export default CostumeTable
