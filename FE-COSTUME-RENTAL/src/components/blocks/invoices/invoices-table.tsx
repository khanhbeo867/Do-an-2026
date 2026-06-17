import { useGetInvoicesQuery, usePayInvoiceMutation } from '@/apis/invoice/hooks/use-invoice-request'
import type { IInvoice, InvoiceStatus } from '@/apis/invoice/types'
import { formatCurrency, formatPhoneNumber } from '@/common/helpers/format-intl'
import { DataGrid } from '@/components/shared/data-grid'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon, type IconProps } from '@/components/ui/icon'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Typography } from '@/components/ui/typography'
import generateAvatar from '@/lib/generate-avatar'
import { createColumnHelper, type FilterFn } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useMemo } from 'react'
import { toast } from 'sonner'
import InvoiceTableToolbar from './invoice-table-toolbar'

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
}

const PAYMENT_METHOD_ICON: Record<string, IconProps['name']> = {
  CASH: 'HandCoins',
  BANK_TRANSFER: 'CreditCard',
}


const multiSelectFilter: FilterFn<IInvoice> = (row, columnId, filterValue: string[]) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true

  const cellValue = row.getValue<string | null>(columnId)

  return filterValue.includes(String(cellValue ?? ''))
}

const InvoicesTable: React.FC = () => {
  const { data, isLoading } = useGetInvoicesQuery()
  const columnHelper = createColumnHelper<IInvoice>()

  const stats = useMemo(() => {
    const list = data || []
    const total = list.length
    const totalRevenue = list.filter((o) => o.status === 'PAID').reduce((acc, o) => acc + Number(o.payment_amount ?? 0), 0)
    const paidCount = list.filter((o) => o.status === 'PAID').length
    const issuedCount = list.filter((o) => o.status === 'ISSUED').length
    return { total, totalRevenue, paidCount, issuedCount }
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
        header: 'Mã hóa đơn',
        size: 120,
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="font-medium before:content-['#'] before:mr-0.5 before:text-muted-foreground">
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('payer_name', {
        header: 'Tên khách hàng',
        size: 240,
        enableGlobalFilter: true,
        enableColumnFilter: true,
        filterFn: multiSelectFilter,
        enableSorting: true,
        cell: ({ row }) => {
          const payerName = row.original.payer_name || 'Khách vãng lai'
          return (
            <Item size="xs" className="p-0 flex-nowrap">
              <ItemMedia>
                <Avatar>
                  <AvatarImage src={generateAvatar({ name: payerName })} />
                  <AvatarFallback>{payerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{payerName}</ItemTitle>
                <ItemDescription>CCCD: {row.original.payer_citizen_id_number || '-'}</ItemDescription>
              </ItemContent>
            </Item>
          )
        },
      }),
      columnHelper.accessor('payer_phone', {
        header: 'Số điện thoại',
        size: 150,
        enableGlobalFilter: true,
        enableSorting: false,
        cell: ({ getValue }) => (getValue() ? formatPhoneNumber(getValue()!) : '-'),
      }),
      columnHelper.accessor('payment_method', {
        header: 'Phương thức thanh toán',
        size: 200,
        enableColumnFilter: true,
        filterFn: multiSelectFilter,
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue()
          if (!value) return '-'
          const isCash = value === 'CASH'
          return (
            <Badge
              variant="outline"
              className={isCash ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'}
            >
              <Icon name={PAYMENT_METHOD_ICON[value]} className="mr-1 size-3.5" />
              {PAYMENT_METHOD_LABEL[value] ?? value}
            </Badge>
          )
        },
      }),
      columnHelper.accessor('payment_amount', {
        header: 'Số tiền thanh toán',
        size: 180,
        enableSorting: true,
        cell: ({ getValue }) => formatCurrency(Number(getValue() ?? 0)),
      }),
      columnHelper.accessor('paid_at', {
        header: 'Ngày thanh toán',
        size: 180,
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue()
          return value ? new Date(value).toLocaleString('vi-VN') : '-'
        },
      }),
      columnHelper.accessor('status', {
        header: 'Trạng thái',
        size: 140,
        enableSorting: false,
        cell: ({ getValue }) => {
          const status = getValue()
          const labelMap: Record<InvoiceStatus, string> = {
            ISSUED: 'Chờ thanh toán',
            UNCONFIRMED: 'Chờ xác nhận',
            PAID: 'Đã thanh toán',
            CANCELED: 'Đã hủy',
          }
          const variantMap: Record<InvoiceStatus, BadgeProps['variant']> = {
            ISSUED: 'outline',
            UNCONFIRMED: 'warning',
            PAID: 'success',
            CANCELED: 'destructive',
          }
          const iconMap: Record<InvoiceStatus, IconProps['name']> = {
            ISSUED: 'Clock',
            UNCONFIRMED: 'CircleAlert',
            PAID: 'Check',
            CANCELED: 'X',
          }
          return (
            <Badge variant={variantMap[status] ?? 'outline'}>
              <Icon name={iconMap[status]} className="mr-1 size-3.5" />
              {labelMap[status] ?? status}
            </Badge>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Thao tác',
        size: 180,
        cell: ({ row }) => {
          const invoice = row.original
          const { mutateAsync: payInvoice, isPending } = usePayInvoiceMutation()

          const handleConfirmPayment = async () => {
            try {
              await payInvoice({ id: invoice.id })
              toast.success('Xác nhận thanh toán hóa đơn thành công!')
            } catch {
              toast.error('Có lỗi xảy ra khi xác nhận thanh toán.')
            }
          }

          if (invoice.status === 'UNCONFIRMED') {
            return (
              <Button
                size="sm"
                variant="default"
                disabled={isPending}
                onClick={handleConfirmPayment}
                className="h-8 py-1 px-3 text-xs bg-success hover:bg-success/90 text-success-foreground"
              >
                Xác nhận thanh toán
              </Button>
            )
          }

          return null
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
              <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tổng hóa đơn</Typography>
              <Typography className="text-xl font-bold font-serif">{stats.total}</Typography>
            </div>
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Icon name="Receipt" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 border border-border/40 shadow-xs hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Doanh thu thu về</Typography>
              <Typography className="text-xl font-bold font-serif text-success">{formatCurrency(stats.totalRevenue)}</Typography>
            </div>
            <div className="size-10 rounded-full bg-success/10 flex items-center justify-center text-success">
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
              <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Chờ thanh toán</Typography>
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
            'xxl:h-[calc(var(--outlet-wrapper-height)-4rem)] h-96 md:max-xxl:h-[calc(var(--outlet-wrapper-height)-8rem)]',
        }}
        virtualizerOptions={{ estimateSize: 56 }}
        toolbarProps={{
          override: true,
          render: InvoiceTableToolbar,
        }}
      />
    </div>
  )
}

export default InvoicesTable
