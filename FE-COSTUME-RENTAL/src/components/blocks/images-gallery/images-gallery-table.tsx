import useAuth from '@/apis/auth/hooks/use-auth-request'
import { useGetImagesQuery } from '@/apis/image/hooks/use-image-request'
import type { IImage } from '@/apis/image/types'
import { rewriteImageUrl } from '@/common/helpers/image-url'
import { DataGrid } from '@/components/shared/data-grid'
import { ROW_ACTIONS_COLUMN_ID } from '@/components/shared/data-grid/constants'
import Image from '@/components/shared/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import generateAvatar from '@/lib/generate-avatar'
import { useSearch } from '@tanstack/react-router'
import { createColumnHelper, type ColumnFiltersState } from '@tanstack/react-table'
import { filesize } from 'filesize'
import { pick } from 'lodash-es'
import { useMemo } from 'react'
import type { DateRange } from 'react-day-picker'
import ImageActionsDropdown from './image-action-dropdown'
import ImageDialog from './image-dialog'

/**
 * Build column filters for gallery table based on search params.
 * Only includes filters when values are provided.
 */
const buildColumnFilters = (
  category: Nullable<string>,
  mimeType: Nullable<string>,
  fromDate: Nullable<string>,
  toDate: Nullable<string>
): ColumnFiltersState => {
  const filters: ColumnFiltersState = []

  if (category) {
    filters.push({ id: 'category', value: category })
  }

  // Add mime_type filter only if provided
  if (mimeType) {
    filters.push({ id: 'mime_type', value: mimeType })
  }

  // Add date range filter only if start date is provided
  if (fromDate) {
    const startDate = new Date(fromDate)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(toDate ?? fromDate)
    endDate.setHours(23, 59, 59, 999)

    filters.push({
      id: 'created_at',
      value: { from: startDate, to: endDate } as DateRange,
    })
  }

  return filters
}

const ImageGalleryTable: React.FC = () => {
  const { data, isLoading } = useGetImagesQuery()
  const { user } = useAuth()
  const search = useSearch({
    from: '/_private-layout/images-gallery',
    select: (state) => pick(state, ['category', 'mime_type', 'from', 'to']),
    structuralSharing: false,
  })

  const columnHelper = createColumnHelper<IImage>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('file_name', {
        header: 'File',
        enableSorting: true,
        enableColumnFilter: true,
        enableGlobalFilter: true,
        cell: ({ row }) => (
          <Item size="xs" className="p-0 flex-nowrap">
            <ItemMedia variant={'icon'}>
              <Image
                src={rewriteImageUrl(row.original.dest)}
                className="size-16 rounded-lg object-cover object-center"
                loading="lazy"
              />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="hover:underline">
                <ImageDialog {...row.original} />
              </ItemTitle>
            </ItemContent>
          </Item>
        ),
      }),
      columnHelper.accessor('mime_type', {
        id: 'mime_type',
        header: 'Định dạng',
        enableColumnFilter: true,
        enableSorting: true,
        filterFn: 'equalsString',
      }),
      columnHelper.accessor('category.slug', {
        id: 'category',
        header: 'Danh mục',
        enableSorting: true,
        enableColumnFilter: true,
        cell: ({ row }) => row.original.category?.name,
      }),
      columnHelper.accessor('size', {
        header: 'Kích thước',
        enableSorting: true,
        enableColumnFilter: true,
        cell: ({ getValue }) => filesize(getValue()),
      }),
      columnHelper.accessor('created_by', {
        header: 'Tải lên bởi',
        size: 200,
        enableColumnFilter: true,
        enableSorting: true,
        enableGlobalFilter: true,
        filterFn: 'inDateRange',
        cell: ({ getValue }) => {
          const owner = getValue()
          if (!owner) return 'Chưa xác định'

          return (
            <Item size="xs" className="p-0">
              <ItemMedia>
                <Avatar>
                  <AvatarImage src={generateAvatar({ name: owner?.employee?.full_name })} />
                  <AvatarFallback>{owner.employee?.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {owner.employee?.full_name} {user?.id === owner.id && '(Bạn)'}
                </ItemTitle>
                <ItemDescription>{owner?.email}</ItemDescription>
              </ItemContent>
            </Item>
          )
        },
      }),
      columnHelper.accessor('created_at', {
        header: 'Ngày tải lên',
        enableColumnFilter: true,
        enableSorting: true,
        sortingFn: 'datetime',
        filterFn: 'inDateRange',
        cell: (info: any) =>
          new Date(info.getValue()).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }),
      }),
      columnHelper.display({
        id: ROW_ACTIONS_COLUMN_ID,
        header: 'Thao tác',
        cell: ImageActionsDropdown,
        enableColumnFilter: false,
        enableSorting: false,
        enableGlobalFilter: false,
        enableResizing: false,
        size: 100,
      }),
    ],
    []
  )

  return (
    <DataGrid
      columns={columns}
      data={data}
      loading={isLoading}
      // manualFiltering={true}
      columnFilters={buildColumnFilters(search.category, search.mime_type, search.from, search.to)}
      toolbarProps={{ override: true, render: () => null }}
      virtualizerOptions={{ estimateSize: 75 }}
      containerProps={{
        className:
          'xxl:h-[calc(var(--outlet-wrapper-height)-4rem)] h-96 md:max-xxl:h-[calc(var(--outlet-wrapper-height)-8rem)]',
      }}
    />
  )
}

export default ImageGalleryTable
