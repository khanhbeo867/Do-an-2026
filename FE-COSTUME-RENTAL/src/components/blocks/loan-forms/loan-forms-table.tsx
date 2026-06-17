import { LOAN_FORM_STATUS_LABEL } from '@/apis/loan-form/constants'
import {
  useCancelLoanFormMutation,
  useConfirmLoanDepositMutation,
  useGetLoanFormsQuery,
  useDeleteLoanFormMutation,
  useStartLoanShippingMutation,
  useCompleteLoanDeliveryMutation,
} from '@/apis/loan-form/hooks/use-loan-form-request'
import type { ILoanForm, LoanFormStatus } from '@/apis/loan-form/types'
import { formatCurrency, formatPhoneNumber } from '@/common/helpers/format-intl'
import { DataGrid } from '@/components/shared/data-grid'
import { ROW_ACTIONS_COLUMN_ID } from '@/components/shared/data-grid/constants'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Typography } from '@/components/ui/typography'
import generateAvatar from '@/lib/generate-avatar'
import { useNavigate } from '@tanstack/react-router'
import { createColumnHelper, type FilterFn } from '@tanstack/react-table'
import { format, isAfter, isSameDay } from 'date-fns'
import React, { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import LoanFormTableToolbar from './loan-form-table-toolbar'

const LoanFormActionsDropdown: React.FC<{ loanForm: ILoanForm }> = ({ loanForm }) => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [openDialog, setOpenDialog] = useState<null | 'cancel' | 'confirm' | 'delete' | 'ship' | 'deliver'>(null)
  const { mutateAsync: cancelLoanAsync, isPending: isCanceling } = useCancelLoanFormMutation()
  const { mutateAsync: confirmDepositAsync, isPending: isConfirmingDeposit } = useConfirmLoanDepositMutation()
  const { mutateAsync: deleteLoanAsync, isPending: isDeleting } = useDeleteLoanFormMutation()
  const { mutateAsync: startShippingAsync, isPending: isStartingShipping } = useStartLoanShippingMutation()
  const { mutateAsync: completeDeliveryAsync, isPending: isCompletingDelivery } = useCompleteLoanDeliveryMutation()

  const canCancel =
    loanForm.status !== 'RETURNED' &&
    loanForm.status !== 'CANCELED' &&
    Boolean(loanForm.created_at && isSameDay(new Date(loanForm.created_at), new Date()))
  const isDepositPaid = loanForm.status === 'BORROWING'
  const isCanceled = loanForm.status === 'CANCELED'

  const handleCancel = async () => {
    try {
      await cancelLoanAsync({ id: loanForm.id })
      toast.success('Đã hủy phiếu thuê/mua')
      setOpenDialog(null)
    } catch {
      toast.error('Không thể hủy phiếu. Vui lòng kiểm tra điều kiện hủy.')
    }
  }

  const handleConfirmDeposit = async () => {
    try {
      await confirmDepositAsync({ id: loanForm.id })
      toast.success(loanForm.method === 'BUY' ? 'Đã xác nhận đơn hàng' : 'Đã xác nhận cọc')
      setOpenDialog(null)
    } catch {
      toast.error('Không thể xác nhận. Vui lòng thử lại.')
    }
  }

  const handleStartShipping = async () => {
    try {
      await startShippingAsync({ id: loanForm.id })
      toast.success('Đã bắt đầu giao đơn hàng')
      setOpenDialog(null)
    } catch {
      toast.error('Không thể chuyển trạng thái giao hàng.')
    }
  }

  const handleCompleteDelivery = async () => {
    try {
      await completeDeliveryAsync({ id: loanForm.id })
      toast.success('Đã xác nhận giao hàng thành công & thanh toán')
      setOpenDialog(null)
    } catch {
      toast.error('Không thể hoàn tất giao hàng.')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteLoanAsync({ id: loanForm.id, permanently: true })
      toast.success('Đã xóa phiếu thuê/mua thành công')
      setOpenDialog(null)
    } catch {
      toast.error('Không thể xóa phiếu. Vui lòng kiểm tra lại.')
    }
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          className="text-muted-foreground hover:text-foreground transition-colors duration-200 ease-in-out cursor-pointer"
        >
          <Icon name="Ellipsis" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="left" align="start" className="w-48">
          <DropdownMenuItem
            disabled={isCanceled}
            onClick={() => {
              navigate({ to: '/loan-forms/update/$id', params: { id: loanForm.id } })
              setOpen(false)
            }}
            className="cursor-pointer"
          >
            Cập nhật
          </DropdownMenuItem>
          {loanForm.status === 'DEPOSIT_PENDING' && (
            <DropdownMenuItem
              onClick={() => {
                setOpen(false)
                setOpenDialog('confirm')
              }}
              className="cursor-pointer"
            >
              {loanForm.method === 'BUY' ? 'Xác nhận đơn hàng' : 'Xác nhận cọc'}
            </DropdownMenuItem>
          )}
          {loanForm.method === 'BUY' && loanForm.status === 'APPROVED' && (
            <DropdownMenuItem
              onClick={() => {
                setOpen(false)
                setOpenDialog('ship')
              }}
              className="cursor-pointer"
            >
              Giao hàng
            </DropdownMenuItem>
          )}
          {loanForm.method === 'BUY' && loanForm.status === 'SHIPPING' && (
            <DropdownMenuItem
              onClick={() => {
                setOpen(false)
                setOpenDialog('deliver')
              }}
              className="cursor-pointer"
            >
              Giao hàng thành công
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant="destructive"
            disabled={!canCancel}
            onClick={() => {
              setOpen(false)
              setOpenDialog('cancel')
            }}
            className="cursor-pointer"
          >
            Hủy phiếu
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setOpen(false)
              setOpenDialog('delete')
            }}
            className="cursor-pointer"
          >
            Xóa phiếu
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={openDialog !== null || isCanceling || isConfirmingDeposit || isDeleting || isStartingShipping || isCompletingDelivery}
        onOpenChange={() => setOpenDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            {openDialog === 'confirm' && (
              <>
                <AlertDialogTitle>
                  {loanForm.method === 'BUY' ? 'Xác nhận đơn hàng?' : 'Xác nhận cọc?'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {loanForm.method === 'BUY'
                    ? 'Bạn có chắc chắn muốn xác nhận đơn hàng mua sản phẩm này? Trạng thái đơn hàng bên khách sẽ chuyển sang "Đã xử lý" (Chưa thanh toán).'
                    : 'Bạn có chắc chắn muốn xác nhận đặt cọc? Trạng thái đơn hàng bên khách sẽ chuyển sang "Đang thuê" (Đã thanh toán cọc) và sản phẩm chuyển sang trạng thái đang thuê.'}
                </AlertDialogDescription>
              </>
            )}
            {openDialog === 'ship' && (
              <>
                <AlertDialogTitle>Bắt đầu giao hàng?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có muốn chuyển đơn hàng sang trạng thái "Đang giao hàng"? Phía tài khoản khách hàng sẽ hiển thị trạng thái này.
                </AlertDialogDescription>
              </>
            )}
            {openDialog === 'deliver' && (
              <>
                <AlertDialogTitle>Xác nhận giao hàng thành công?</AlertDialogTitle>
                <AlertDialogDescription>
                  Xác nhận rằng đơn hàng đã giao tới tay khách hàng và khách hàng đã thanh toán thành công (bằng tiền mặt COD hoặc chuyển khoản).
                </AlertDialogDescription>
              </>
            )}
            {openDialog === 'cancel' && (
              <>
                <AlertDialogTitle>Xác nhận hủy phiếu thuê/mua?</AlertDialogTitle>
                <AlertDialogDescription>
                  Chỉ được hủy trong ngày tạo phiếu và phiếu chưa ở trạng thái trả đồ. Khi hủy, sản phẩm sẽ về trạng
                  thái "Sẵn hàng".
                </AlertDialogDescription>
              </>
            )}
            {openDialog === 'delete' && (
              <>
                <AlertDialogTitle>Xác nhận xóa phiếu thuê/mua?</AlertDialogTitle>
                <AlertDialogDescription>
                  Phiếu sẽ bị xóa hoàn toàn khỏi hệ thống danh sách và không thể khôi phục. Các thông tin liên quan cũng sẽ bị xóa. Bạn có chắc chắn muốn tiếp tục?
                </AlertDialogDescription>
              </>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không</AlertDialogCancel>
            <AlertDialogAction
              disabled={isCanceling || isConfirmingDeposit || isDeleting || isStartingShipping || isCompletingDelivery}
              onClick={() => {
                if (openDialog === 'confirm') handleConfirmDeposit()
                else if (openDialog === 'ship') handleStartShipping()
                else if (openDialog === 'deliver') handleCompleteDelivery()
                else if (openDialog === 'cancel') handleCancel()
                else if (openDialog === 'delete') handleDelete()
              }}
            >
              {isCanceling || isConfirmingDeposit || isDeleting || isStartingShipping || isCompletingDelivery
                ? 'Đang xử lý...'
                : openDialog === 'confirm'
                  ? (loanForm.method === 'BUY' ? 'Xác nhận đơn' : 'Xác nhận cọc')
                  : openDialog === 'ship'
                    ? 'Bắt đầu giao'
                    : openDialog === 'deliver'
                      ? 'Giao thành công'
                      : openDialog === 'cancel'
                        ? 'Xác nhận hủy'
                        : 'Xác nhận xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const multiSelectFilter: FilterFn<ILoanForm> = (row, columnId, filterValue: string[]) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true

  const cellValue = row.getValue<string | null>(columnId)

  return filterValue.includes(String(cellValue ?? ''))
}

const singleValueFilter: FilterFn<ILoanForm> = (row, columnId, filterValue: string) => {
  if (!filterValue) return true

  const cellValue = row.getValue<string | null>(columnId)
  return String(cellValue ?? '') === String(filterValue)
}

const LoanFormsTable: React.FC = () => {
  const { data, isLoading } = useGetLoanFormsQuery()
  const columnHelper = createColumnHelper<ILoanForm>()

  const stats = useMemo(() => {
    const list = data || []
    const total = list.length
    const buyCount = list.filter((o) => o.method === 'BUY').length
    const rentCount = list.filter((o) => o.method === 'RENT').length
    const pendingCount = list.filter((o) => o.status === 'DEPOSIT_PENDING').length
    const pendingAmount = list
      .filter((o) => o.status === 'DEPOSIT_PENDING')
      .reduce((acc, o) => acc + Number(o.method === 'BUY' ? (o.total_item_price_amount ?? 0) : (o.total_rental_amount ?? 0)), 0)

    return { total, buyCount, rentCount, pendingCount, pendingAmount }
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
      columnHelper.accessor('borrower_name', {
        header: 'Người thuê/mua',
        size: 260,
        enableGlobalFilter: true,
        enableColumnFilter: true,
        filterFn: multiSelectFilter,
        cell: ({ row }) => (
          <Item size="xs" className="p-0 flex-nowrap">
            <ItemMedia>
              <Avatar>
                <AvatarImage src={generateAvatar({ name: row.original.borrower_name })} />
                <AvatarFallback>{row.original.borrower_name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{row.original.borrower_name}</ItemTitle>
              <ItemDescription>CCCD: {row.original.borrower_citizen_id_number || '-'}</ItemDescription>
            </ItemContent>
          </Item>
        ),
      }),
      columnHelper.accessor('borrower_phone', {
        header: 'Số điện thoại',
        size: 150,
        cell: ({ getValue }) => formatPhoneNumber(getValue() ?? ''),
      }),
      columnHelper.accessor('method', {
        header: 'Loại phiếu',
        size: 140,
        enableColumnFilter: true,
        filterFn: singleValueFilter,
        cell: ({ getValue }) => {
          const value = getValue()
          return <Badge variant="outline">{value === 'BUY' ? 'Mua sản phẩm' : 'Thuê lẻ'}</Badge>
        },
      }),
      columnHelper.accessor('created_at', {
        header: 'Ngày tạo',
        size: 180,
        cell: ({ getValue }) => {
          const value = getValue()
          return value ? format(value, 'dd/MM/yyyy') : '-'
        },
      }),
      columnHelper.accessor('due_date', {
        header: 'Ngày hẹn trả',
        size: 150,
        cell: ({ getValue }) => {
          const value = getValue()
          return value ? format(value, 'dd/MM/yyyy') : '-'
        },
      }),
      columnHelper.accessor('total_rental_amount', {
        header: 'Tổng tiền',
        size: 170,
        cell: ({ getValue, row }) => {
          if (row.original.method === 'BUY') {
            return formatCurrency(Number(row.original.total_item_price_amount ?? 0))
          }
          return formatCurrency(Number(getValue() ?? 0))
        },
      }),
      columnHelper.accessor('deposit_amount', {
        header: 'Tổng tiền đã cọc',
        size: 170,
        cell: ({ getValue, row }) => {
          const deposit = Number(getValue() ?? 0)
          return row.original.method === 'RENT' ? (
            deposit === 0 ? (
              <Typography variant="small" color="muted">
                Chưa cọc
              </Typography>
            ) : (
              formatCurrency(row.original?.total_item_price_amount ?? 0)
            )
          ) : (
            '-'
          )
        },
      }),
      columnHelper.accessor('status', {
        header: 'Trạng thái',
        size: 140,
        enableColumnFilter: true,
        filterFn: multiSelectFilter,
        cell: ({ getValue, row }) => {
          const status = getValue()
          const statusBadgeVariantMap: Map<LoanFormStatus, BadgeProps['variant']> = new Map([
            ['BORROWING', 'secondary'],
            ['DEPOSIT_PENDING', 'outline'],
            ['APPROVED', 'secondary'],
            ['SHIPPING', 'warning'],
            ['RETURNED', 'default'],
            ['CANCELED', 'destructive'],
            ['PAID', 'success'],
          ])
          const statusInfo = LOAN_FORM_STATUS_LABEL.get(status)
          if (!statusInfo) return <Badge variant="outline">Không xác định</Badge>

          let text = statusInfo.text
          if (row.original.method === 'BUY') {
            if (status === 'DEPOSIT_PENDING') text = 'Chờ xử lý'
            else if (status === 'PAID') text = 'Đã xác nhận'
          }

          const isOverdue = status === 'BORROWING' && isAfter(new Date(), new Date(row.original.due_date ?? ''))

          return (
            <Badge variant={isOverdue ? 'destructive' : statusBadgeVariantMap.get(status)}>
              <Icon name={isOverdue ? 'Clock' : statusInfo.icon} />
              {isOverdue ? 'Quá hạn trả' : text}
            </Badge>
          )
        },
      }),
      columnHelper.accessor('created_by_employee', {
        header: 'Người tạo phiếu',
        size: 220,
        cell: ({ getValue }) => {
          const employee = getValue()
          const name = employee?.full_name

          if (!name)
            return (
              <Typography variant="small" color="muted">
                Chưa cập nhật
              </Typography>
            )

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
                <ItemDescription>{employee?.employee_code || '-'}</ItemDescription>
              </ItemContent>
            </Item>
          )
        },
      }),
      columnHelper.accessor('updated_by_employee', {
        header: 'Người cập nhật',
        size: 220,
        cell: ({ getValue }) => {
          const employee = getValue()
          if (!employee)
            return (
              <Typography variant="small" color="muted">
                Chưa cập nhật
              </Typography>
            )

          const name = employee?.full_name || 'Chưa cập nhật'

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
                <ItemDescription>{employee?.employee_code || '-'}</ItemDescription>
              </ItemContent>
            </Item>
          )
        },
      }),

      columnHelper.display({
        id: ROW_ACTIONS_COLUMN_ID,
        header: '',
        size: 80,
        cell: ({ row }) => <LoanFormActionsDropdown loanForm={row.original} />,
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
              <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tổng số phiếu</Typography>
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
              <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Đơn mua sản phẩm</Typography>
              <Typography className="text-xl font-bold font-serif text-success">{stats.buyCount}</Typography>
            </div>
            <div className="size-10 rounded-full bg-success/10 flex items-center justify-center text-success">
              <Icon name="ShoppingBag" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 border border-border/40 shadow-xs hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phiếu thuê lẻ</Typography>
              <Typography className="text-xl font-bold font-serif text-info">{stats.rentCount}</Typography>
            </div>
            <div className="size-10 rounded-full bg-info/10 flex items-center justify-center text-info">
              <Icon name="Calendar" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 border border-border/40 shadow-xs hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Chờ xử lý / Chưa thanh toán</Typography>
              <Typography className="text-xl font-bold font-serif text-warning">
                {stats.pendingCount} <span className="text-xs font-sans font-normal text-muted-foreground">({formatCurrency(stats.pendingAmount)})</span>
              </Typography>
            </div>
            <div className="size-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <Icon name="Clock" size={20} />
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
        getRowClassName={(row) => (row.original.status === 'CANCELED' ? 'opacity-50 text-muted-foreground' : '')}
        virtualizerOptions={{ estimateSize: 56 }}
        toolbarProps={{
          override: true,
          render: LoanFormTableToolbar,
        }}
      />
    </div>
  )
}

export default LoanFormsTable
