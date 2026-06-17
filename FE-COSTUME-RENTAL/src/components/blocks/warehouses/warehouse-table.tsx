import { useGetWarehouseQuery } from '@/apis/warehouse/hooks/use-warehouse-request'
import type { IWarehouse } from '@/apis/warehouse/types'
import { ItemType } from '@/common/constants/enums'
import { DataGrid } from '@/components/shared/data-grid'
import { ROW_ACTIONS_COLUMN_ID } from '@/components/shared/data-grid/constants'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Icon, type IconProps } from '@/components/ui/icon'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Typography } from '@/components/ui/typography'
import generateAvatar from '@/lib/generate-avatar'
import { createColumnHelper } from '@tanstack/react-table'
import React, { useMemo, useRef } from 'react'
import WarehouseActionsDropdown from './warehouse-actions-dropdown'
import WarehouseTableToolbar from './warehouse-table-toolbar'

const WarehouseTable: React.FC = () => {
  const { data, isLoading } = useGetWarehouseQuery()

  const columnHelper = createColumnHelper<IWarehouse>()

  const warehouseTypeRef = useRef<Map<ItemType, string>>(
    new Map<ItemType, string>([
      [ItemType.COSTUME, 'Kho trang phục'],
      [ItemType.EQUIPMENT_PROPS, 'Kho đạo cụ'],
    ])
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Tên kho',
        enableSorting: true,
        enableColumnFilter: true,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('type', {
        header: 'Loại kho',
        enableSorting: false,
        enableColumnFilter: true,
        filterFn: 'arrIncludesSome',
        cell: ({ getValue }) => {
          const value = getValue()
          return warehouseTypeRef.current.get(value)
        },
      }),
      columnHelper.accessor('manager.id', {
        header: 'Người quản lý',
        enableColumnFilter: true,
        filterFn: 'equals',
        cell: ({ row }) => {
          const employee = row.original.manager

          if (!employee)
            return (
              <Typography variant="small" color="muted">
                Chưa xác định
              </Typography>
            )

          return (
            <Item className="p-0" size="xs">
              <ItemMedia>
                <Avatar>
                  <AvatarImage src={generateAvatar({ name: employee?.full_name })} />
                  <AvatarFallback>{employee?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{employee.full_name}</ItemTitle>
                <ItemDescription>{employee.email}</ItemDescription>
              </ItemContent>
            </Item>
          )
        },
      }),
      columnHelper.accessor('created_at', {
        header: 'Ngày tạo lên',
        enableColumnFilter: true,
        enableSorting: true,
        sortingFn: 'datetime',
        cell: (info: any) =>
          new Date(info.getValue()).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }),
      }),
      columnHelper.accessor('is_active', {
        id: 'is_active',
        header: 'Trạng thái',
        enableHiding: true,
        cell: ({ getValue }) => {
          const value = getValue()

          const badgeHelper: {
            icon: IconProps['name']
            text: string
            color: `var(--${'success' | 'muted-foreground'})`
          } = value
            ? {
                icon: 'CircleCheckBig',
                text: 'Đang hoạt động',
                color: 'var(--success)',
              }
            : {
                icon: 'Lock',
                text: 'Tạm khóa',
                color: 'var(--muted-foreground)',
              }

          return (
            <Badge variant="outline" className="justify-center gap-x-2 rounded-l-full rounded-r-full whitespace-nowrap">
              <Icon aria-current={value} name={badgeHelper?.icon as IconProps['name']} stroke={badgeHelper?.color} />
              {badgeHelper?.text}
            </Badge>
          )
        },
        enableSorting: true,
        enableColumnFilter: true,
        enableGlobalFilter: true,
        enableResizing: true,
      }),
      columnHelper.display({
        id: ROW_ACTIONS_COLUMN_ID,
        header: 'Thao tác',
        cell: WarehouseActionsDropdown,
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
      data={data}
      columns={columns}
      loading={isLoading}
      virtualizerOptions={{ estimateSize: 60 }}
      toolbarProps={{ override: true, render: WarehouseTableToolbar }}
      containerProps={{
        className:
          'xxl:h-[calc(var(--outlet-wrapper-height)-2rem)] h-96 md:max-xxl:h-[calc(var(--outlet-wrapper-height)-8rem)]',
      }}
    />
  )
}

export default WarehouseTable
