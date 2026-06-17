import { useGetReturnFormsQuery } from '@/apis/return-form/hooks/use-return-form-request'
import type { IReturnForm } from '@/apis/return-form/types'
import { formatPhoneNumber } from '@/common/helpers/format-intl'
import { DataGrid } from '@/components/shared/data-grid'
import { ROW_ACTIONS_COLUMN_ID } from '@/components/shared/data-grid/constants'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Typography } from '@/components/ui/typography'
import generateAvatar from '@/lib/generate-avatar'
import { Link } from '@tanstack/react-router'
import { createColumnHelper, type FilterFn } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useMemo } from 'react'
import ReturnFormTableToolbar from './return-form-table-toolbar'

const multiSelectFilter: FilterFn<IReturnForm> = (row, columnId, filterValue: string[]) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true

  const cellValue = row.getValue<string | null>(columnId)

  return filterValue.includes(String(cellValue ?? ''))
}

const ReturnFormsTable: React.FC = () => {
  const { data, isLoading } = useGetReturnFormsQuery()
  const columnHelper = createColumnHelper<IReturnForm>()

  const stats = useMemo(() => {
    const list = data || []
    const total = list.length
    const rentCount = list.filter((o) => o.method === 'RENT').length
    return { total, rentCount }
  }, [data])

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => (row.created_at ? format(new Date(row.created_at), 'MM/yyyy') : ''), {
        id: 'month',
        header: 'Tháng',
        enableColumnFilter: true,
        filterFn: multiSelectFilter,
        meta: { hidden: true } as any,
      }),
      columnHelper.accessor('code', {
        header: 'Mã phiếu',
        size: 120,
        cell: ({ getValue }) => (
          <span className="font-medium before:content-['#'] before:mr-0.5 before:text-muted-foreground">
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('loan_form_code', {
        header: 'Phiếu thuê',
        size: 140,
        enableGlobalFilter: true,
        cell: ({ getValue }) => (
          <span className="font-medium before:content-['#'] before:mr-0.5 before:text-muted-foreground">
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.loan_form?.borrower_name ?? row.returnee_name, {
        id: 'borrower_name',
        header: 'Người thuê',
        size: 220,
        enableGlobalFilter: true,
        enableColumnFilter: true,
        filterFn: multiSelectFilter,
        cell: ({ getValue }) => {
          const value = getValue()
          return (
            <Item size="xs" className="p-0 flex-nowrap">
              <ItemMedia>
                <Avatar>
                  <AvatarImage src={generateAvatar({ name: value })} />
                  <AvatarFallback>{value?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{value}</ItemTitle>
              </ItemContent>
            </Item>
          )
        },
      }),
      columnHelper.accessor('returnee_name', {
        header: 'Người trả',
        size: 220,
        enableGlobalFilter: true,
        cell: ({ getValue }) => {
          const value = getValue()
          return (
            <Item size="xs" className="p-0 flex-nowrap">
              <ItemMedia>
                <Avatar>
                  <AvatarImage src={generateAvatar({ name: value })} />
                  <AvatarFallback>{value?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{value}</ItemTitle>
              </ItemContent>
            </Item>
          )
        },
      }),
      columnHelper.accessor('returnee_phone', {
        header: 'Số điện thoại',
        size: 160,
        enableGlobalFilter: true,
        cell: ({ getValue }) => (getValue() ? formatPhoneNumber(getValue()!) : '-'),
      }),
      columnHelper.accessor('created_by_employee', {
        header: 'Người tạo phiếu',
        size: 220,
        cell: ({ getValue }) => {
          const employee = getValue()
          const name = employee?.full_name || 'Không xác định'

          return (
            <Item size="xs" className="p-0 flex-nowrap">
              <ItemMedia>
                <Avatar>
                  <AvatarImage src={generateAvatar({ name })} />
                  <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{name}</ItemTitle>
              </ItemContent>
            </Item>
          )
        },
      }),
      columnHelper.accessor('created_at', {
        header: 'Thời gian tạo phiếu',
        size: 180,
        cell: ({ getValue }) => {
          const value = getValue()
          return value ? format(new Date(value), 'dd/MM/yyyy HH:mm') : '-'
        },
      }),
      columnHelper.display({
        id: ROW_ACTIONS_COLUMN_ID,
        header: '',
        size: 100,
        cell: ({ row }) => (
          <Link
            to="/return-forms/update/$id"
            params={{ id: row.original.id }}
            className={buttonVariants({ variant: 'ghost', size: 'xs' })}
          >
            Cập nhật
          </Link>
        ),
      }),
    ],
    []
  )

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-card to-muted/20 border border-border/40 shadow-xs hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tổng phiếu trả</Typography>
              <Typography className="text-xl font-bold font-serif">{stats.total}</Typography>
            </div>
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Icon name="Undo2" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 border border-border/40 shadow-xs hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phiếu trả của đơn thuê</Typography>
              <Typography className="text-xl font-bold font-serif text-info">{stats.rentCount}</Typography>
            </div>
            <div className="size-10 rounded-full bg-info/10 flex items-center justify-center text-info">
              <Icon name="Calendar" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      <DataGrid
        columns={columns}
        data={data}
        loading={isLoading}
        containerProps={{
          className:
            'xxl:h-[calc(var(--outlet-wrapper-height)-2rem)] h-96 md:max-xxl:h-[calc(var(--outlet-wrapper-height)-8rem)]',
        }}
        virtualizerOptions={{ estimateSize: 56 }}
        toolbarProps={{
          override: true,
          render: ReturnFormTableToolbar,
        }}
      />
    </div>
  )
}

export default ReturnFormsTable
