import { useGetPenaltyFormsQuery } from '@/apis/penalty-form/hooks/use-penalty-form-request'
import type { IPenaltyForm } from '@/apis/penalty-form/types'
import { formatCurrency } from '@/common/helpers/format-intl'
import { DataGrid } from '@/components/shared/data-grid'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Typography } from '@/components/ui/typography'
import generateAvatar from '@/lib/generate-avatar'
import { createColumnHelper, type FilterFn } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useCallback, useMemo } from 'react'
import PenaltyFormTableToolbar from './penalty-form-table-toolbar'

const multiSelectFilter: FilterFn<IPenaltyForm> = (row, columnId, filterValue: string[]) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true

  const cellValue = row.getValue<string | null>(columnId)

  return filterValue.includes(String(cellValue ?? ''))
}

const PenaltyFormsTable: React.FC = () => {
  const { data, isLoading } = useGetPenaltyFormsQuery()
  const columnHelper = createColumnHelper<IPenaltyForm>()

  const stats = useMemo(() => {
    const list = data || []
    const total = list.length
    const totalAmount = list.reduce((acc, o) => acc + Number(o.amount ?? 0), 0)
    const paidCount = list.filter((o) => o.status === 'PAID').length
    const issuedCount = list.filter((o) => o.status === 'ISSUED').length
    return { total, totalAmount, paidCount, issuedCount }
  }, [data])

  const renderSubComponent = useCallback(({ row }: { row: { original: IPenaltyForm } }) => {
    const reason = row.original.reason?.trim() || 'Không có lý do phạt'

    return (
      <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/10 space-y-1">
        <div className="text-xs font-semibold text-destructive/80 uppercase tracking-wider flex items-center gap-1.5">
          <Icon name="TriangleAlert" size={14} /> Lý do phạt
        </div>
        <div className="text-sm leading-6 text-foreground/90 font-medium">{reason}</div>
      </div>
    )
  }, [])

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
      columnHelper.accessor(
        (row) =>
          row.loan_form?.borrower_name ??
          row.return_form?.loan_form?.borrower_name ??
          row.return_form?.returnee_name ??
          '-',
        {
          id: 'borrower_name',
          header: 'Người thuê',
          size: 220,
          enableGlobalFilter: true,
          enableColumnFilter: true,
          filterFn: multiSelectFilter,
          cell: ({ getValue }) => {
            const borrowerName = getValue() || 'Không xác định'
            return (
              <Item size="xs" className="p-0 flex-nowrap">
                <ItemMedia>
                  <Avatar>
                    <AvatarImage src={generateAvatar({ name: borrowerName })} />
                    <AvatarFallback>{borrowerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{borrowerName}</ItemTitle>
                </ItemContent>
              </Item>
            )
          },
        }
      ),
      columnHelper.accessor('loan_form_code', {
        header: 'Phiếu thuê',
        size: 140,
        cell: ({ row }) => row.original.return_form_code ?? row.original.loan_form_code ?? '-',
      }),
      columnHelper.accessor('amount', {
        header: 'Số tiền phạt',
        size: 160,
        cell: ({ getValue }) => (
          <span className="font-semibold text-destructive">
            {formatCurrency(Number(getValue() ?? 0))}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Trạng thái',
        size: 150,
        cell: ({ getValue }) => {
          const status = getValue()
          const labelMap = {
            ISSUED: 'Chưa thanh toán',
            PAID: 'Đã thanh toán',
            CANCELED: 'Đã hủy',
          }
          const variantMap: Record<string, BadgeProps['variant']> = {
            ISSUED: 'outline',
            PAID: 'success',
            CANCELED: 'destructive',
          }
          return (
            <Badge variant={variantMap[status] ?? 'outline'}>
              {labelMap[status] || status}
            </Badge>
          )
        },
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
        header: 'Ngày tạo',
        size: 180,
        cell: ({ getValue }) => {
          const value = getValue()
          return value ? new Date(value).toLocaleString('vi-VN') : '-'
        },
      }),
    ],
    []
  )

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card to-muted/20 border border-border/40 shadow-xs hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tổng số phiếu phạt</Typography>
              <Typography className="text-xl font-bold font-serif">{stats.total}</Typography>
            </div>
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Icon name="FileText" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 border border-border/40 shadow-xs hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tổng tiền phạt</Typography>
              <Typography className="text-xl font-bold font-serif text-destructive">{formatCurrency(stats.totalAmount)}</Typography>
            </div>
            <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <Icon name="CircleDollarSign" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 border border-border/40 shadow-xs hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Đã thanh toán</Typography>
              <Typography className="text-xl font-bold font-serif text-success">{stats.paidCount}</Typography>
            </div>
            <div className="size-10 rounded-full bg-success/10 flex items-center justify-center text-success">
              <Icon name="CircleCheck" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 border border-border/40 shadow-xs hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Chưa thanh toán</Typography>
              <Typography className="text-xl font-bold font-serif text-warning">{stats.issuedCount}</Typography>
            </div>
            <div className="size-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <Icon name="CircleAlert" size={20} />
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
          render: PenaltyFormTableToolbar,
        }}
        renderSubComponent={renderSubComponent}
      />
    </div>
  )
}

export default PenaltyFormsTable
