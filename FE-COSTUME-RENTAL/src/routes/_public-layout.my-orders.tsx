import { getAuthUserQueryOptions } from '@/apis/auth/hooks/use-auth-request'
import {
  getLoanFormsQueryOptions,
  useCancelLoanFormMutation,
  useConfirmLoanDepositMutation,
  useGetLoanFormsQuery,
} from '@/apis/loan-form/hooks/use-loan-form-request'
import { useCustomerPayInvoiceMutation } from '@/apis/invoice/hooks/use-invoice-request'
import { formatCurrency } from '@/common/helpers/format-intl'
import { rewriteImageUrl } from '@/common/helpers/image-url'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import {
  ArrowLeftIcon,
  CalendarIcon,
  PackageIcon,
  RefreshCw,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  User,
  XCircle,
  Truck,
} from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

const myOrdersSearchSchema = z.object({
  method: z.enum(['RENT', 'BUY']).optional(),
})

export const Route = createFileRoute('/_public-layout/my-orders')({
  validateSearch: (search) => myOrdersSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: 'Đơn hàng của tôi' },
      {
        name: 'description',
        content: 'Theo dõi tình trạng đơn hàng thuê và mua trang phục, đạo cụ của bạn.',
      },
    ],
  }),
  beforeLoad: async ({ context }) => {
    try {
      const user = await context.queryClient.ensureQueryData(getAuthUserQueryOptions())
      if (!user) {
        throw redirect({ to: '/login' })
      }
    } catch {
      throw redirect({ to: '/login' })
    }
  },
  loader: async ({ context }) => {
    const [_, user] = await Promise.all([
      context.queryClient.ensureQueryData(getLoanFormsQueryOptions()),
      context.queryClient.ensureQueryData(getAuthUserQueryOptions()),
    ])
    return { user }
  },
  component: MyOrdersPage,
})

type TabStatus = 'ALL' | 'DEPOSIT_PENDING' | 'BORROWING' | 'RETURNED' | 'CANCELED' | 'PAID'

function MyOrdersPage() {
  const routeData = Route.useLoaderData()
  const user = (routeData as any)?.user
  const { method } = Route.useSearch()
  const activeMethod = method || 'ALL'
  const navigate = Route.useNavigate()

  const { data: allLoanForms, refetch } = useGetLoanFormsQuery()
  const { mutateAsync: cancelOrder, isPending: isCancelling } = useCancelLoanFormMutation()
  const { mutateAsync: confirmPayment, isPending: isPaying } = useConfirmLoanDepositMutation()
  const { mutateAsync: customerPayInvoice, isPending: isPayingInvoice } = useCustomerPayInvoiceMutation()
  const [activeTab, setActiveTab] = useState<TabStatus>('ALL')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  // Filter forms belonging to this user
  const userOrders = (allLoanForms || []).filter((order: any) => {
    // Check match by saved local storage phone scoped to user
    const savedPhone = typeof window !== 'undefined' && user?.username
      ? localStorage.getItem(`customer_checkout_phone_${user.username}`)
      : null
    if (savedPhone && order.borrower_phone === savedPhone) return true

    // Check match by phone
    if (user?.employee?.phone && order.borrower_phone === user.employee.phone) return true
    // Fallback match by name/username
    if (
      order.borrower_name?.toLowerCase() === user?.display_name?.toLowerCase() ||
      order.borrower_name?.toLowerCase() === user?.username?.toLowerCase()
    ) {
      return true
    }
    return false
  })

  // Filter by method (RENT vs BUY)
  const methodFilteredOrders = userOrders.filter((order: any) => {
    if (activeMethod === 'ALL') return true
    return order.method === activeMethod
  })

  // Tab configurations dynamically based on activeMethod
  const tabs = useMemo(() => {
    const baseTabs = [{ label: 'Tất cả đơn', value: 'ALL' as TabStatus }]
    if (activeMethod === 'ALL' || activeMethod === 'RENT') {
      baseTabs.push(
        { label: 'Chờ xử lý', value: 'DEPOSIT_PENDING' as TabStatus },
        { label: 'Đang thuê', value: 'BORROWING' as TabStatus },
        { label: 'Đã trả đồ', value: 'RETURNED' as TabStatus }
      )
    }
    if (activeMethod === 'ALL' || activeMethod === 'BUY') {
      if (activeMethod === 'BUY') {
        baseTabs.push({ label: 'Chờ thanh toán', value: 'DEPOSIT_PENDING' as TabStatus })
      }
      baseTabs.push({ label: 'Đã thanh toán', value: 'PAID' as TabStatus })
    }
    baseTabs.push({ label: 'Đã hủy', value: 'CANCELED' as TabStatus })
    return baseTabs
  }, [activeMethod])

  useEffect(() => {
    // Reset active tab if it's not valid for the current method tabs
    const isValidTab = tabs.some((tab) => tab.value === activeTab)
    if (!isValidTab) {
      setActiveTab('ALL')
    }
  }, [tabs, activeTab])

  // Get status count helper
  const getCount = (status: TabStatus) => {
    if (status === 'ALL') return methodFilteredOrders.length
    if (status === 'DEPOSIT_PENDING') {
      return methodFilteredOrders.filter((o: any) => 
        o.status === 'DEPOSIT_PENDING' || o.status === 'APPROVED' || o.status === 'SHIPPING' || o.status === 'DELIVERED'
      ).length
    }
    return methodFilteredOrders.filter((o: any) => o.status === status).length
  }

  // Filter orders by active tab
  const filteredOrders = methodFilteredOrders.filter((order: any) => {
    if (activeTab === 'ALL') return true
    if (activeTab === 'DEPOSIT_PENDING') {
      return order.status === 'DEPOSIT_PENDING' || order.status === 'APPROVED' || order.status === 'SHIPPING' || order.status === 'DELIVERED'
    }
    return order.status === activeTab
  })

  const handleCancelOrder = async (id: number) => {
    try {
      await cancelOrder({ id })
      toast.success('Hủy đơn hàng thành công!')
      refetch()
    } catch (err: any) {
      toast.error(err?.message || 'Không thể hủy đơn hàng này. Chỉ có thể hủy trong ngày tạo.')
    }
  }

  const handlePayOrder = async (id: number) => {
    try {
      await confirmPayment({ id })
      toast.success('Thanh toán đơn hàng thành công!')
      refetch()
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra trong quá trình thanh toán')
    }
  }

  const handleCustomerPayment = async (orderId: number, orderCode: string, invoices: any[]) => {
    const issuedInvoice = invoices?.find((inv) => inv.status === 'ISSUED')
    if (!issuedInvoice) {
      toast.error('Không tìm thấy hóa đơn cần thanh toán cho đơn hàng này.')
      return
    }
    try {
      await customerPayInvoice({ id: issuedInvoice.id })
      toast.success('Đã gửi thông tin thanh toán! Vui lòng chờ Admin xác nhận.')
      refetch()
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra trong quá trình thanh toán')
    }
  }

  const handleMethodTabChange = (newMethod: 'ALL' | 'RENT' | 'BUY') => {
    navigate({
      search: (prev) => ({
        ...prev,
        method: newMethod === 'ALL' ? undefined : newMethod,
      }),
    })
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-6 max-w-4xl">
      {/* Header bar matching Photo 1 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), "rounded-full size-10")}>
            <ArrowLeftIcon className="size-5" />
          </Link>
          <div>
            <Typography as="h1" className="font-serif text-lg sm:text-xl font-bold">
              Đơn hàng của tôi
            </Typography>
            <Typography className="text-xs text-muted-foreground">
              {user?.display_name || user?.username}
            </Typography>
          </div>
        </div>

        <Button variant="outline" size="icon" onClick={() => refetch()} className="rounded-full">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {/* Segmented Control for Method Selection */}
      <div className="bg-muted p-1 rounded-lg flex items-center max-w-md w-full border border-border/30">
        <button
          onClick={() => handleMethodTabChange('ALL')}
          className={cn(
            "flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer",
            activeMethod === 'ALL'
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Tất cả giao dịch
        </button>
        <button
          onClick={() => handleMethodTabChange('RENT')}
          className={cn(
            "flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer",
            activeMethod === 'RENT'
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Đơn thuê đồ
        </button>
        <button
          onClick={() => handleMethodTabChange('BUY')}
          className={cn(
            "flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer",
            activeMethod === 'BUY'
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Lịch sử mua hàng
        </button>
      </div>

      {/* Tabs navigation matching Photo 1 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b">
        {tabs.map((tab) => {
          const count = getCount(tab.value)
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-4 py-2 text-xs sm:text-sm font-semibold rounded-full border shrink-0 transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {tab.label}
              {count > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 text-[10px] font-bold rounded-full",
                  activeTab === tab.value
                    ? "bg-primary-foreground text-primary"
                    : "bg-muted-foreground/20 text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-card">
            <PackageIcon className="size-12 mx-auto text-muted-foreground/45 mb-3" />
            <Typography className="text-muted-foreground">Không có đơn hàng nào.</Typography>
          </div>
        ) : (
          filteredOrders.map((order: any) => {
            const formattedDate = new Date(order.created_at).toLocaleDateString('vi-VN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
            return (
              <Card key={order.id} className="shadow-xs border border-border/40 overflow-hidden bg-card">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  {/* Top info card row */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Typography className="text-primary font-bold text-sm sm:text-base">
                        #{order.code}
                      </Typography>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarIcon className="size-3.5" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {/* Status Badges */}
                      {order.status === 'DEPOSIT_PENDING' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-warning/10 text-warning border border-warning/20">
                          Chờ xử lý
                        </span>
                      )}
                      {order.status === 'APPROVED' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          Đã xử lý
                        </span>
                      )}
                      {order.status === 'SHIPPING' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-warning/10 text-warning border border-warning/20 inline-flex items-center gap-1">
                          <Truck className="size-3.5" />
                          Đang giao hàng
                        </span>
                      )}
                      {order.status === 'DELIVERED' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 inline-flex items-center gap-1">
                          <PackageIcon className="size-3.5" />
                          Đã giao hàng
                        </span>
                      )}
                      {order.status === 'BORROWING' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                          Đang thuê
                        </span>
                      )}
                      {order.status === 'RETURNED' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20">
                          Đã trả đồ
                        </span>
                      )}
                      {order.status === 'PAID' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20">
                          {order.method === 'BUY' ? 'Đã thanh toán' : 'Đã thanh toán cọc'}
                        </span>
                      )}
                      {order.status === 'CANCELED' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
                          Đã hủy
                        </span>
                      )}

                      {/* Payment status badge */}
                      {order.invoices && order.invoices.some((inv: any) => inv.status === 'UNCONFIRMED') ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-600">
                          Chờ xác nhận thanh toán
                        </span>
                      ) : (order.status === 'DEPOSIT_PENDING' || order.status === 'APPROVED' || order.status === 'SHIPPING' || order.status === 'DELIVERED') ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-warning/15 text-warning">
                          Chưa thanh toán
                        </span>
                      ) : order.status !== 'CANCELED' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success">
                          Đã thanh toán
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <Separator className="bg-border/60" />

                  {/* Items list */}
                  <div className="space-y-3">
                    {order.items &&
                      order.items.map((item: any) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="size-16 rounded bg-muted border overflow-hidden shrink-0">
                            {item.item_detail?.images?.[0]?.dest ? (
                              <img
                                src={rewriteImageUrl(item.item_detail.images[0].dest)}
                                alt={item.loan_item_name}
                                className="size-full object-cover object-top"
                              />
                            ) : (
                              <div className="size-full flex items-center justify-center">
                                <PackageIcon className="size-6 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <Typography className="font-semibold text-sm sm:text-base line-clamp-1">
                              {item.loan_item_name}
                            </Typography>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                              <span>
                                {order.method === 'BUY'
                                  ? `SL: 1 x ${formatCurrency(item.item_price ?? 0)}`
                                  : `SL: 1 x ${formatCurrency(item.rental_price_per_day)}/ngày`}
                              </span>
                              {item.size && (
                                <span className="bg-muted px-1.5 py-0.5 rounded font-medium">Size: {item.size}</span>
                              )}
                              {item.sku && (
                                <span className="bg-muted px-1.5 py-0.5 rounded font-medium">SKU: {item.sku}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <Typography className="font-semibold text-sm">
                              {formatCurrency(
                                order.method === 'BUY'
                                  ? Number(item.item_price ?? 0)
                                  : item.rental_price_per_day * (order.rental_days || 1)
                              )}
                            </Typography>
                          </div>
                        </div>
                      ))}
                  </div>

                  <Separator className="bg-border/60" />

                  {/* Total price & Actions row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Tổng tiền:</span>
                      <Typography className="text-foreground font-serif text-lg sm:text-xl font-bold">
                        {formatCurrency(
                          order.method === 'BUY'
                            ? (order.total_item_price_amount ?? 0)
                            : (order.total_rental_amount || order.deposit_amount)
                        )}
                      </Typography>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'DEPOSIT_PENDING' && (
                        <Button
                          variant="outline"
                          disabled={isCancelling}
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-destructive hover:bg-destructive/5 hover:text-destructive border-destructive/40 text-xs py-1.5"
                        >
                          Hủy đơn hàng
                        </Button>
                      )}
                      {order.status === 'DELIVERED' && order.invoices && order.invoices.some((inv: any) => inv.status === 'ISSUED') && (
                        <Button
                          variant="default"
                          disabled={isPayingInvoice}
                          onClick={() => handleCustomerPayment(order.id, order.code, order.invoices)}
                          className="text-xs py-1.5 bg-success hover:bg-success/90 text-success-foreground"
                        >
                          Thanh toán
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="text-xs py-1.5"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Dialog Chi tiết đơn hàng */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          {selectedOrder && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center justify-between border-b pb-4">
                  <DialogTitle className="font-serif text-xl font-bold flex items-center gap-2">
                    <FileText className="size-5 text-primary" />
                    Chi tiết đơn hàng #{selectedOrder.code}
                  </DialogTitle>
                </div>
              </DialogHeader>

              {/* Order Status Banner */}
              <div className={cn(
                "p-4 rounded-lg flex items-center gap-3 border",
                selectedOrder.status === 'DEPOSIT_PENDING' && "bg-warning/10 text-warning border-warning/20",
                selectedOrder.status === 'APPROVED' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                selectedOrder.status === 'SHIPPING' && "bg-warning/10 text-warning border-warning/20",
                selectedOrder.status === 'DELIVERED' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                selectedOrder.status === 'BORROWING' && "bg-primary/10 text-primary border-primary/20",
                (selectedOrder.status === 'RETURNED' || selectedOrder.status === 'PAID') && "bg-success/10 text-success border-success/20",
                selectedOrder.status === 'CANCELED' && "bg-destructive/10 text-destructive border-destructive/20"
              )}>
                {selectedOrder.status === 'DEPOSIT_PENDING' && (
                  <>
                    <Clock className="size-5 shrink-0" />
                    <div>
                      <Typography className="font-bold text-sm">Chờ xử lý / Thanh toán</Typography>
                      <Typography className="text-xs opacity-90">Đơn hàng đang chờ nhân viên kiểm duyệt và xác nhận.</Typography>
                    </div>
                  </>
                )}
                {selectedOrder.status === 'APPROVED' && (
                  <>
                    <CheckCircle2 className="size-5 shrink-0" />
                    <div>
                      <Typography className="font-bold text-sm">Đã xử lý</Typography>
                      <Typography className="text-xs opacity-90">Đơn hàng đã được xác nhận và đang chuẩn bị giao hàng.</Typography>
                    </div>
                  </>
                )}
                {selectedOrder.status === 'SHIPPING' && (
                  <>
                    <Truck className="size-5 shrink-0" />
                    <div>
                      <Typography className="font-bold text-sm">Đang giao hàng</Typography>
                      <Typography className="text-xs opacity-90">Đơn hàng đang được vận chuyển đến địa chỉ của bạn.</Typography>
                    </div>
                  </>
                )}
                {selectedOrder.status === 'DELIVERED' && (
                  <>
                    <PackageIcon className="size-5 shrink-0" />
                    <div>
                      <Typography className="font-bold text-sm">Đã giao hàng</Typography>
                      <Typography className="text-xs opacity-90">Đơn hàng đã được giao thành công tới bạn. Vui lòng thanh toán.</Typography>
                    </div>
                  </>
                )}
                {selectedOrder.status === 'BORROWING' && (
                  <>
                    <Clock className="size-5 shrink-0" />
                    <div>
                      <Typography className="font-bold text-sm">Đang xử lý / Đang thuê</Typography>
                      <Typography className="text-xs opacity-90">Sản phẩm đang được khách hàng thuê.</Typography>
                    </div>
                  </>
                )}
                {selectedOrder.status === 'PAID' && (
                  <>
                    <CheckCircle2 className="size-5 shrink-0" />
                    <div>
                      <Typography className="font-bold text-sm">
                        Đã thanh toán
                      </Typography>
                      <Typography className="text-xs opacity-90">
                        Đơn hàng đã thanh toán thành công.
                      </Typography>
                    </div>
                  </>
                )}
                {selectedOrder.status === 'RETURNED' && (
                  <>
                    <CheckCircle2 className="size-5 shrink-0" />
                    <div>
                      <Typography className="font-bold text-sm">Đã hoàn thành / Đã trả</Typography>
                      <Typography className="text-xs opacity-90">Sản phẩm đã được hoàn trả đầy đủ và hoàn tất đơn hàng.</Typography>
                    </div>
                  </>
                )}
                {selectedOrder.status === 'CANCELED' && (
                  <>
                    <XCircle className="size-5 shrink-0" />
                    <div>
                      <Typography className="font-bold text-sm">Đã hủy</Typography>
                      <Typography className="text-xs opacity-90">Đơn hàng này đã bị hủy bỏ.</Typography>
                    </div>
                  </>
                )}
              </div>

              {/* 2-Column Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Borrower Information */}
                <div className="space-y-3 p-4 rounded-lg border bg-muted/20">
                  <Typography className="font-bold text-sm flex items-center gap-1.5 text-foreground">
                    <User className="size-4 text-muted-foreground" />
                    Thông tin khách hàng
                  </Typography>
                  <Separator className="my-2" />
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Người đặt:</span>
                      <span className="font-semibold">{selectedOrder.borrower_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số điện thoại:</span>
                      <span className="font-semibold">{selectedOrder.borrower_phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số CCCD/CMND:</span>
                      <span className="font-semibold">{selectedOrder.borrower_citizen_id_number || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vai trò:</span>
                      <span className="font-semibold">{selectedOrder.borrower_role === 'STUDENT' ? 'Sinh viên' : 'Khác'}</span>
                    </div>
                    {selectedOrder.remark && (
                      <>
                        <Separator className="my-1.5 opacity-50" />
                        <div className="space-y-1">
                          <span className="text-muted-foreground block">Thông tin giao nhận/Ghi chú:</span>
                          <span className="font-medium text-foreground block break-words leading-relaxed text-xs">
                            {selectedOrder.remark}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Rental Information */}
                <div className="space-y-3 p-4 rounded-lg border bg-muted/20">
                  <Typography className="font-bold text-sm flex items-center gap-1.5 text-foreground">
                    <CalendarIcon className="size-4 text-muted-foreground" />
                    Thông tin thuê/mua
                  </Typography>
                  <Separator className="my-2" />
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loại đơn:</span>
                      <span className="font-semibold">
                        {selectedOrder.method === 'RENT' ? 'Thuê lẻ' : 'Mua sản phẩm'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày đặt:</span>
                      <span className="font-semibold">
                        {new Date(selectedOrder.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    {selectedOrder.method !== 'BUY' && selectedOrder.due_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ngày hẹn trả:</span>
                        <span className="font-semibold text-primary">
                          {new Date(selectedOrder.due_date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                    {selectedOrder.method !== 'BUY' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Số ngày thuê:</span>
                        <span className="font-semibold">{selectedOrder.rental_days || 1} ngày</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <Typography className="font-bold text-sm flex items-center gap-1.5 text-foreground">
                  <PackageIcon className="size-4 text-muted-foreground" />
                  Sản phẩm đã đặt
                </Typography>
                <div className="border rounded-lg overflow-hidden divide-y">
                  {selectedOrder.items && selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-4 bg-card text-xs">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded bg-muted border overflow-hidden shrink-0">
                          {item.item_detail?.images?.[0]?.dest ? (
                            <img
                              src={rewriteImageUrl(item.item_detail.images[0].dest)}
                              alt={item.loan_item_name}
                              className="size-full object-cover object-top"
                            />
                          ) : (
                            <div className="size-full flex items-center justify-center">
                              <PackageIcon className="size-5 text-muted-foreground/45" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Typography className="font-semibold text-sm line-clamp-1">{item.loan_item_name}</Typography>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                            <span>SKU: {item.sku || '-'}</span>
                            {item.size && <span className="bg-muted px-1 rounded">Size: {item.size}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Typography className="font-semibold text-sm">
                          {selectedOrder.method === 'BUY'
                            ? formatCurrency(item.item_price ?? 0)
                            : `${formatCurrency(item.rental_price_per_day)}/ngày`}
                        </Typography>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          {selectedOrder.method === 'BUY'
                            ? 'Giá bán'
                            : `Tạm tính: ${formatCurrency(item.rental_price_per_day * (selectedOrder.rental_days || 1))}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-lg border bg-muted/10 space-y-3">
                <Typography className="font-bold text-sm flex items-center gap-1.5 text-foreground">
                  <CreditCard className="size-4 text-muted-foreground" />
                  Chi tiết thanh toán
                </Typography>
                <Separator className="my-2" />
                <div className="space-y-2 text-xs">
                  {selectedOrder.method === 'BUY' ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tổng tiền mua sản phẩm:</span>
                      <span>{formatCurrency(selectedOrder.total_item_price_amount || 0)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tạm tính tiền thuê:</span>
                        <span>{formatCurrency(selectedOrder.total_rental_amount || 0)}</span>
                      </div>
                      {selectedOrder.method === 'RENT' && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tiền đặt cọc (Tổng giá trị sản phẩm):</span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(selectedOrder.deposit_amount || selectedOrder.total_item_price_amount || 0)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground">Tổng cộng:</span>
                    <span className="text-lg font-bold text-primary font-serif">
                      {formatCurrency(
                        selectedOrder.method === 'BUY'
                          ? (selectedOrder.total_item_price_amount ?? 0)
                          : (selectedOrder.total_rental_amount || selectedOrder.deposit_amount || 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.status === 'DEPOSIT_PENDING' && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    disabled={isCancelling}
                    onClick={() => {
                      handleCancelOrder(selectedOrder.id)
                      setSelectedOrder(null)
                    }}
                    className="text-destructive hover:bg-destructive/5 border-destructive/40"
                  >
                    Hủy đơn hàng
                  </Button>
                </div>
              )}
              {selectedOrder.status === 'DELIVERED' && selectedOrder.invoices && selectedOrder.invoices.some((inv: any) => inv.status === 'ISSUED') && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="default"
                    disabled={isPayingInvoice}
                    onClick={() => {
                      handleCustomerPayment(selectedOrder.id, selectedOrder.code, selectedOrder.invoices)
                      setSelectedOrder(null)
                    }}
                    className="bg-success hover:bg-success/90 text-success-foreground"
                  >
                    Thanh toán
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
