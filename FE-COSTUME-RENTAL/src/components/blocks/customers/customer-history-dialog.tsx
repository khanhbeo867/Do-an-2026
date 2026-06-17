import { useGetLoanFormsQuery } from '@/apis/loan-form/hooks/use-loan-form-request'
import type { IUser } from '@/apis/user/types'
import { CommonActions } from '@/common/constants/enums'
import { formatCurrency } from '@/common/helpers/format-intl'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Typography } from '@/components/ui/typography'
import { usePageEventContext } from '@/contexts/event-context'
import { CalendarIcon, PackageIcon, Receipt } from 'lucide-react'
import React, { useState, useMemo } from 'react'

const normalizeString = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[đĐ]/g, 'd')
}

const CustomerHistoryDialog: React.FC = () => {
  const { event$ } = usePageEventContext()
  const [open, setOpen] = useState<boolean>(false)
  const [selectedCustomer, setSelectedCustomer] = useState<IUser | null>(null)

  const { data: allLoanForms } = useGetLoanFormsQuery()

  event$.useSubscription((e: any) => {
    if (e.action !== CommonActions.READ) return
    setSelectedCustomer(e.payload)
    setOpen(true)
  })

  // Filter forms belonging to selected customer
  const customerOrders = useMemo(() => {
    if (!selectedCustomer || !allLoanForms) return []
    
    const customerPhone = selectedCustomer.employee?.phone
      ? selectedCustomer.employee.phone.replace(/\D/g, '')
      : null
    const customerName = selectedCustomer.employee?.full_name || selectedCustomer.username
    const normalizedCustomerName = customerName ? normalizeString(customerName) : ''
    const normalizedUsername = selectedCustomer.username ? normalizeString(selectedCustomer.username) : ''
    
    return allLoanForms.filter((order: any) => {
      // 1. Match by phone if both have phone numbers
      if (customerPhone && order.borrower_phone) {
        const orderPhone = order.borrower_phone.replace(/\D/g, '')
        if (orderPhone === customerPhone) return true
      }
      
      // 2. Match by normalized name
      if (order.borrower_name) {
        const normalizedOrderName = normalizeString(order.borrower_name)
        if (
          normalizedOrderName === normalizedCustomerName ||
          normalizedOrderName === normalizedUsername
        ) {
          return true
        }
      }
      
      return false
    })
  }, [allLoanForms, selectedCustomer])

  const rentOrders = useMemo(() => {
    return customerOrders.filter((order: any) => order.method === 'RENT')
  }, [customerOrders])

  const buyOrders = useMemo(() => {
    return customerOrders.filter((order: any) => order.method === 'BUY')
  }, [customerOrders])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DEPOSIT_PENDING':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-warning/15 text-warning border border-warning/20 rounded-full">Chờ xử lý</span>
      case 'APPROVED':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/20 rounded-full">Đã xử lý</span>
      case 'SHIPPING':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-warning/15 text-warning border border-warning/20 rounded-full">Đang giao hàng</span>
      case 'DELIVERED':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/20 rounded-full">Đã giao hàng</span>
      case 'BORROWING':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/15 text-primary border border-primary/20 rounded-full">Đang thuê</span>
      case 'RETURNED':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-success/15 text-success border border-success/20 rounded-full">Đã trả đồ</span>
      case 'PAID':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-success/15 text-success border border-success/20 rounded-full">Đã thanh toán</span>
      case 'CANCELED':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-destructive/15 text-destructive border border-destructive/20 rounded-full">Đã hủy</span>
      default:
        return null
    }
  }

  const renderOrderList = (orders: any[]) => {
    if (orders.length === 0) {
      return (
        <div className="text-center py-8 border rounded-lg bg-card">
          <PackageIcon className="size-10 mx-auto text-muted-foreground/45 mb-2" />
          <Typography className="text-muted-foreground text-xs">Không có lịch sử giao dịch.</Typography>
        </div>
      )
    }

    return (
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        {orders.map((order) => {
          const formattedDate = new Date(order.created_at).toLocaleDateString('vi-VN', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
          })
          return (
            <div key={order.id} className="p-3 border border-border/60 rounded-lg bg-card space-y-2.5">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-primary">#{order.code}</span>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <CalendarIcon className="size-3" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              <div className="space-y-1.5 pl-2 border-l-2 border-muted">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-xs gap-3">
                    <span className="font-medium line-clamp-1">{item.loan_item_name}</span>
                    <span className="text-muted-foreground shrink-0">
                      {order.method === 'BUY'
                        ? formatCurrency(item.item_price ?? 0)
                        : `${formatCurrency(item.rental_price_per_day)}/ngày`}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="bg-border/40" />

              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Tổng cộng:</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(
                    order.method === 'BUY'
                      ? (order.total_item_price_amount ?? 0)
                      : (order.total_rental_amount || order.deposit_amount)
                  )}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const customerName = selectedCustomer?.employee?.full_name || selectedCustomer?.username || 'Khách hàng'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg font-bold flex items-center gap-2">
            <Receipt className="size-5 text-primary" />
            Lịch sử giao dịch
          </DialogTitle>
          <Typography className="text-xs text-muted-foreground pt-1">
            Khách hàng: <span className="font-semibold text-foreground">{customerName}</span> 
            {(selectedCustomer?.phone || selectedCustomer?.employee?.phone) && ` - SĐT: ${selectedCustomer.phone || selectedCustomer.employee.phone}`}
          </Typography>
        </DialogHeader>

        <Tabs defaultValue="rent" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg">
            <TabsTrigger value="rent" className="py-1.5 text-xs font-semibold rounded-md">
              Lịch sử thuê ({rentOrders.length})
            </TabsTrigger>
            <TabsTrigger value="buy" className="py-1.5 text-xs font-semibold rounded-md">
              Lịch sử mua ({buyOrders.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="rent" className="pt-3">
            {renderOrderList(rentOrders)}
          </TabsContent>
          
          <TabsContent value="buy" className="pt-3">
            {renderOrderList(buyOrders)}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
          <DialogClose render={<Button variant="outline" size="sm">Đóng</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CustomerHistoryDialog
