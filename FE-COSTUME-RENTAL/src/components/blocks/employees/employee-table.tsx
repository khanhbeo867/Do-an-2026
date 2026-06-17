import { DataGrid } from '@/components/shared/data-grid'
import { ROW_ACTIONS_COLUMN_ID } from '@/components/shared/data-grid/constants'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Typography } from '@/components/ui/typography'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
// import { format } from 'date-fns'
import { getEmployeeQueryOptions } from '@/apis/employee/hooks/use-employee-request'
import type { IEmployee } from '@/apis/employee/types'
import { formatPhoneNumber } from '@/common/helpers/format-intl'
import TableCellText from '@/components/shared/data-grid/components/table-cell-text'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import generateAvatar from '@/lib/generate-avatar'
import { cn } from '@/lib/utils'
import { format, isValid } from 'date-fns'
import { useMemo } from 'react'
import EmployeeActionDropdown from './employee-action-dropdown'
import EmployeeTableToolbar from './employee-table-toolbar'
import PositionBadge from './position-badge'
import WorkStatusBadge from './work-status-badge'

const EmployeeTable: React.FC = () => {
  const { data, isLoading } = useSuspenseQuery(getEmployeeQueryOptions())

  const columnHelper = createColumnHelper<IEmployee>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('full_name', {
        header: 'Họ tên & Email',
        size: 200,
        minSize: 200,
        cell: ({ getValue, row }) => {
          return (
            <Item size="xs" className="p-0 flex-nowrap">
              <ItemMedia>
                <Avatar className="col-start-1 row-span-2">
                  <AvatarImage src={generateAvatar({ name: row.original.full_name })} alt={row.original.full_name} />
                  <AvatarFallback>G</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle className={cn({ 'line-through': !row.original.is_active })}>{getValue()}</ItemTitle>
                <ItemDescription>{row.original.email}</ItemDescription>
              </ItemContent>
            </Item>
          )
        },
      }),
      columnHelper.accessor('employee_code', {
        header: 'Mã nhân viên',
        cell: (props) => (
          <TableCellText
            {...props}
            className='before:[content:"#"] font-medium before:text-normal before:text-muted-foreground'
          />
        ),
      }),
      columnHelper.accessor('citizen_id_number', {
        header: 'Số CMND/CCCD',
        cell: TableCellText,
      }),
      columnHelper.accessor('phone', {
        header: 'Số điện thoại',
        cell: ({ getValue }) => {
          const value = getValue()
          if (!value)
            return (
              <Typography variant="small" color="muted">
                Chưa xác định
              </Typography>
            )
          return formatPhoneNumber(value)
        },
      }),
      columnHelper.accessor('position', {
        header: 'Vị trí',
        cell: ({ getValue }) => <PositionBadge value={getValue()} />,
        filterFn: 'arrIncludesSome',
        enableSorting: true,
        enableColumnFilter: true,
        enableGlobalFilter: true,
        enableResizing: true,
        enableHiding: true,
      }),
      columnHelper.accessor('work_status', {
        header: 'Trạng thái làm việc',
        cell: ({ getValue }) => <WorkStatusBadge value={getValue()} />,
        filterFn: 'arrIncludesSome',
        enableSorting: true,
        enableColumnFilter: true,
        enableGlobalFilter: true,
        enableResizing: true,
        enableHiding: true,
      }),
      columnHelper.accessor('created_at', {
        header: 'Ngày đăng bắt đầu làm việc',
        cell: ({ getValue }) => {
          const value = getValue()
          return value && isValid(new Date(value)) ? (
            format(new Date(value), 'dd/MM/yyyy')
          ) : (
            <Typography variant="small" color="muted">
              Chưa xác định
            </Typography>
          )
        },
      }),

      columnHelper.display({
        id: ROW_ACTIONS_COLUMN_ID,
        meta: { align: 'center' },
        size: 60,
        maxSize: 60,
        enableHiding: false,
        cell: EmployeeActionDropdown,
      }),
    ],
    []
  )

  return (
    <DataGrid
      columns={columns}
      data={data}
      loading={isLoading}
      border="bottom-only"
      defaultFilterOpen={false}
      containerProps={{
        className:
          'xxl:h-[calc(var(--outlet-wrapper-height)-4rem)] h-96 md:max-xxl:h-[calc(var(--outlet-wrapper-height)-8rem)]',
      }}
      virtualizerOptions={{ estimateSize: 56 }}
      toolbarProps={{
        override: true,
        render: EmployeeTableToolbar,
      }}
    />
  )
}

export default EmployeeTable
