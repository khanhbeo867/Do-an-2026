import { getAuthUserQueryOptions } from '@/apis/auth/hooks/use-auth-request'
import {
  getCostumeInventoryQueryOptions,
  getPropsInventoryQueryOptions,
  useGetCostumeInventoryQuery,
  useGetPropsInventoryQuery,
} from '@/apis/inventory/hooks/use-inventory-request'
import { useCreateCustomerOrderMutation, getLoanFormsQueryOptions } from '@/apis/loan-form/hooks/use-loan-form-request'
import { formatCurrency } from '@/common/helpers/format-intl'
import { rewriteImageUrl } from '@/common/helpers/image-url'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { useCartStore } from '@/hooks/use-cart-store'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { addDays, format } from 'date-fns'
import { CheckCircle2, CreditCard, Landmark, MapPin, ShoppingBagIcon, Truck } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_public-layout/checkout')({
  head: () => ({
    meta: [
      { title: 'Thanh toán đơn hàng' },
      {
        name: 'description',
        content: 'Hoàn tất thông tin giao hàng và chọn phương thức thanh toán để đặt thuê trang phục.',
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
    const [_, __, user] = await Promise.all([
      context.queryClient.ensureQueryData(getCostumeInventoryQueryOptions()),
      context.queryClient.ensureQueryData(getPropsInventoryQueryOptions()),
      context.queryClient.ensureQueryData(getAuthUserQueryOptions()),
    ])
    return { user }
  },
  component: CheckoutPage,
})

function CheckoutPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { items, clearSelected } = useCartStore()
  const selectedItems = items.filter((item) => item.selected)

  if (selectedItems.length === 0) {
    throw redirect({ to: '/cart' })
  }

  // Pre-load data from loader queries
  const { data: costumeInventory } = useGetCostumeInventoryQuery()
  const { data: propsInventory } = useGetPropsInventoryQuery()
  const routeData = Route.useLoaderData()
  const user = (routeData as any)?.user

  const { mutateAsync: createCustomerOrder, isPending: isSubmitting } = useCreateCustomerOrderMutation()

  // Recipient form state
  const [recipientName, setRecipientName] = useState(user?.display_name || '')
  const [recipientPhone, setRecipientPhone] = useState(user?.employee?.phone || '')
  const [shippingAddress, setShippingAddress] = useState(user?.employee?.address || '')
  const [note, setNote] = useState('')
  const minDueDateStr = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 2), 'yyyy-MM-dd'))

  useEffect(() => {
    if (user?.username) {
      const savedName = localStorage.getItem(`customer_checkout_name_${user.username}`)
      const savedPhone = localStorage.getItem(`customer_checkout_phone_${user.username}`)
      const savedAddress = localStorage.getItem(`customer_checkout_address_${user.username}`)
      if (savedName) setRecipientName(savedName)
      if (savedPhone) setRecipientPhone(savedPhone)
      if (savedAddress) setShippingAddress(savedAddress)
    }
  }, [user?.username])

  // Checkout transaction method state (RENT or BUY)
  const [checkoutMethod, setCheckoutMethod] = useState<'RENT' | 'BUY'>('RENT')

  // Shipping & payment methods state
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOMO'>('COD')
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherApplied, setVoucherApplied] = useState(false)
  const [voucherDiscountRate, setVoucherDiscountRate] = useState(0)

  // Map selected items to include their purchase price from inventory
  const selectedItemsWithPrices = useMemo(() => {
    return selectedItems.map((cartItem) => {
      const pId = Number(cartItem.productId)
      let purchasePrice = cartItem.price * 10 // Fallback

      if (cartItem.type === 'costume') {
        const costume = costumeInventory?.find((c: any) => c.id === pId)
        if (costume && costume.price !== undefined && costume.price !== null) {
          purchasePrice = Number(costume.price)
        }
      } else {
        const prop = propsInventory?.find((p: any) => p.id === pId)
        if (prop && prop.price !== undefined && prop.price !== null) {
          purchasePrice = Number(prop.price)
        }
      }

      return {
        ...cartItem,
        purchasePrice,
      }
    })
  }, [selectedItems, costumeInventory, propsInventory])

  // Calculate rental days based on dueDate
  const rentalDays = useMemo(() => {
    if (checkoutMethod !== 'RENT' || !dueDate) return 1
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const [todayYear, todayMonth, todayDay] = todayStr.split('-').map(Number)
    const [dueYear, dueMonth, dueDay] = dueDate.split('-').map(Number)

    const start = new Date(todayYear, todayMonth - 1, todayDay)
    const end = new Date(dueYear, dueMonth - 1, dueDay)

    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 1
  }, [dueDate, checkoutMethod])

  // Calculations
  const selectedCount = selectedItems.reduce((acc, item) => acc + item.quantity, 0)
  const selectedSubtotal = selectedItemsWithPrices.reduce(
    (acc, item) => acc + (checkoutMethod === 'BUY' ? item.purchasePrice : item.price * rentalDays) * item.quantity,
    0
  )
  const discountAmount = useMemo(() => {
    if (!voucherApplied) return 0
    return Math.round(selectedSubtotal * voucherDiscountRate)
  }, [voucherApplied, voucherDiscountRate, selectedSubtotal])

  const finalSubtotal = Math.max(0, selectedSubtotal - discountAmount)
  const shippingFee = 0
  const totalAmount = finalSubtotal + shippingFee

  // Map CartItems to real available SKUs in inventory
  const getSelectedSkus = (): string[] => {
    const skus: string[] = []
    selectedItems.forEach((cartItem) => {
      const pId = Number(cartItem.productId)
      let matchedSkus: string[] = []

      if (cartItem.type === 'costume') {
        const costume = costumeInventory?.find((c: any) => c.id === pId)
        if (costume && costume.details) {
          const available = costume.details.filter(
            (d: any) => d.status === 'AVAILABLE' && d.size === cartItem.size
          )
          matchedSkus = available.slice(0, cartItem.quantity).map((d: any) => d.sku)
        }
      } else {
        const prop = propsInventory?.find((p: any) => p.id === pId)
        if (prop && prop.details) {
          const available = prop.details.filter((d: any) => d.status === 'AVAILABLE')
          matchedSkus = available.slice(0, cartItem.quantity).map((d: any) => d.sku)
        }
      }

      // If inventory details are missing or there aren't enough available items, fallback to mock SKUs
      while (matchedSkus.length < cartItem.quantity) {
        const fallbackSku = `SKU-FALLBACK-${cartItem.productId}-${cartItem.size || 'PROP'}-${matchedSkus.length + 1}`
        matchedSkus.push(fallbackSku)
      }

      skus.push(...matchedSkus)
    })
    return skus
  }

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) return
    // Simple mock voucher logic
    if (voucherCode.toUpperCase() === 'DIAMOND10') {
      setVoucherDiscountRate(0.1)
      setVoucherApplied(true)
      toast.success('Áp dụng mã giảm giá 10% thành công!')
    } else {
      toast.error('Mã giảm giá không chính xác hoặc đã hết hạn')
    }
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipientName.trim()) {
      toast.error('Vui lòng nhập họ tên người nhận')
      return
    }
    if (!recipientPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }
    if (!shippingAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ nhận hàng')
      return
    }
    if (checkoutMethod === 'RENT' && !dueDate) {
      toast.error('Vui lòng chọn ngày trả dự kiến')
      return
    }

    try {
      const skus = getSelectedSkus()
      let orderRemark = `Địa chỉ: ${shippingAddress}`
      if (note.trim()) {
        orderRemark += ` | Ghi chú: ${note}`
      }

      await createCustomerOrder({
        borrower_name: recipientName,
        borrower_phone: recipientPhone,
        borrower_citizen_id_number: user?.employee?.citizen_id_number || null,
        borrower_role: 'EXTERNAL',
        due_date: checkoutMethod === 'BUY' ? null : new Date(dueDate).toISOString(),
        method: checkoutMethod,
        deposit_amount: 0,
        remark: orderRemark,
        loan_items: skus.map((sku) => ({ sku })),
      })

      if (user?.username) {
        localStorage.setItem(`customer_checkout_name_${user.username}`, recipientName)
        localStorage.setItem(`customer_checkout_phone_${user.username}`, recipientPhone)
        localStorage.setItem(`customer_checkout_address_${user.username}`, shippingAddress)
      }

      await queryClient.invalidateQueries(getLoanFormsQueryOptions())
      toast.success(checkoutMethod === 'BUY' ? 'Đặt mua sản phẩm thành công!' : 'Thuê sản phẩm thành công!')
      clearSelected()
      router.navigate({ to: '/my-orders', search: { method: checkoutMethod } })
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra trong quá trình đặt hàng')
    }
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-8">
      {/* Checkout Stepper */}
      <div className="flex items-center justify-center gap-2 sm:gap-6 py-4 bg-card rounded-lg shadow-xs border">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
          <span className="flex size-6 items-center justify-center rounded-full bg-muted font-bold text-xs">
            1
          </span>
          Đơn hàng
        </div>
        <div className="h-px w-8 sm:w-16 bg-muted-foreground/30" />
        <div className="flex items-center gap-2 text-primary text-sm font-semibold">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary font-bold text-xs text-primary-foreground">
            2
          </span>
          Thanh toán
        </div>
        <div className="h-px w-8 sm:w-16 bg-muted-foreground/30" />
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
          <span className="flex size-6 items-center justify-center rounded-full bg-muted font-bold text-xs">
            3
          </span>
          Xác nhận
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Recipient Details & Payment info */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-8 space-y-6">
          {/* Transaction Method Selection */}
          <Card className="shadow-xs border border-border/40 bg-card">
            <CardContent className="p-6 space-y-4">
              <Typography className="font-serif text-lg font-bold flex items-center gap-2">
                <ShoppingBagIcon className="size-5 text-primary" /> PHƯƠNG THỨC GIAO DỊCH
              </Typography>
              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Rent Option */}
                <div
                  onClick={() => setCheckoutMethod('RENT')}
                  className={cn(
                    "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                    checkoutMethod === 'RENT' ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                    checkoutMethod === 'RENT' ? "border-primary" : "border-muted-foreground"
                  )}>
                    {checkoutMethod === 'RENT' && <div className="size-2 rounded-full bg-primary" />}
                  </div>
                  <div className="space-y-1">
                    <Typography className="font-semibold text-sm">Thuê trang phục / đạo cụ</Typography>
                    <Typography className="text-xs text-muted-foreground">Trả phí theo ngày sử dụng, cần đặt cọc và hoàn trả sản phẩm đúng hạn.</Typography>
                  </div>
                </div>

                {/* Buy Option */}
                <div
                  onClick={() => setCheckoutMethod('BUY')}
                  className={cn(
                    "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                    checkoutMethod === 'BUY' ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                    checkoutMethod === 'BUY' ? "border-primary" : "border-muted-foreground"
                  )}>
                    {checkoutMethod === 'BUY' && <div className="size-2 rounded-full bg-primary" />}
                  </div>
                  <div className="space-y-1">
                    <Typography className="font-semibold text-sm">Mua đứt sản phẩm</Typography>
                    <Typography className="text-xs text-muted-foreground">Sở hữu vĩnh viễn sản phẩm, thanh toán một lần và không cần hoàn trả.</Typography>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipient details */}
          <Card className="shadow-xs">
            <CardContent className="p-6 space-y-4">
              <Typography className="font-serif text-lg font-bold flex items-center gap-2">
                <MapPin className="size-5 text-primary" /> THÔNG TIN NGƯỜI NHẬN
              </Typography>
              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="fullname">Họ tên người nhận *</Label>
                  <input
                    id="fullname"
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="0123456789"
                    className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm bg-background"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="address">Địa chỉ giao hàng (Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP) *</Label>
                <input
                  id="address"
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="VD: 123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. HCM"
                  className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm bg-background"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {checkoutMethod === 'RENT' && (
                  <div className="space-y-1">
                    <Label htmlFor="dueDate">Ngày trả dự kiến *</Label>
                    <input
                      id="dueDate"
                      type="date"
                      required
                      min={minDueDateStr}
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm bg-background cursor-pointer"
                    />
                  </div>
                )}
                <div className={cn("space-y-1", checkoutMethod === 'BUY' && "sm:col-span-2")}>
                  <Label htmlFor="note">Ghi chú (không bắt buộc)</Label>
                  <input
                    id="note"
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú thêm về đơn hàng hoặc thời gian giao hàng..."
                    className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm bg-background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Method */}
          <Card className="shadow-xs">
            <CardContent className="p-6 space-y-4">
              <Typography className="font-serif text-lg font-bold flex items-center gap-2">
                <Truck className="size-5 text-primary" /> PHƯƠNG THỨC GIAO HÀNG
              </Typography>
              <Separator />

              <div className="flex items-center justify-between p-4 border rounded-lg border-primary/50 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="size-4 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="size-2 rounded-full bg-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <Typography className="font-semibold text-sm">Giao hàng tiêu chuẩn</Typography>
                    <Typography className="text-xs text-muted-foreground">Toàn quốc (2-5 ngày)</Typography>
                  </div>
                </div>
                <Typography className="font-bold text-sm text-primary">Miễn phí</Typography>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="shadow-xs">
            <CardContent className="p-6 space-y-4">
              <Typography className="font-serif text-lg font-bold flex items-center gap-2">
                <CreditCard className="size-5 text-primary" /> PHƯƠNG THỨC THANH TOÁN
              </Typography>
              <Separator />

              <div className="space-y-3">
                {/* COD option */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={cn(
                    "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                    paymentMethod === 'COD' ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "size-4 rounded-full border flex items-center justify-center shrink-0",
                    paymentMethod === 'COD' ? "border-primary" : "border-muted-foreground"
                  )}>
                    {paymentMethod === 'COD' && <div className="size-2 rounded-full bg-primary" />}
                  </div>
                  <div className="size-10 rounded bg-success/10 text-success flex items-center justify-center shrink-0">
                    <Landmark className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <Typography className="font-semibold text-sm">Thanh toán khi nhận hàng (COD)</Typography>
                    <Typography className="text-xs text-muted-foreground">Trả tiền mặt khi nhận được hàng</Typography>
                  </div>
                </div>

                {/* MoMo option */}
                <div
                  onClick={() => setPaymentMethod('MOMO')}
                  className={cn(
                    "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                    paymentMethod === 'MOMO' ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "size-4 rounded-full border flex items-center justify-center shrink-0",
                    paymentMethod === 'MOMO' ? "border-primary" : "border-muted-foreground"
                  )}>
                    {paymentMethod === 'MOMO' && <div className="size-2 rounded-full bg-primary" />}
                  </div>
                  <div className="size-10 rounded overflow-hidden shrink-0 border">
                    <div className="size-full bg-[#A50064] text-white font-bold text-center text-xs flex items-center justify-center">
                      MoMo
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <Typography className="font-semibold text-sm">Ví MoMo</Typography>
                    <Typography className="text-xs text-muted-foreground">Thanh toán qua ví MoMo, chuyển hướng tới cổng thanh toán</Typography>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voucher */}
          <Card className="shadow-xs">
            <CardContent className="p-6 space-y-4">
              <Typography className="font-serif text-lg font-bold flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" /> MÃ VOUCHER
              </Typography>
              <Separator />

              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  disabled={voucherApplied}
                  placeholder="NHẬP MÃ VOUCHER... (Ví dụ: DIAMOND10)"
                  className="flex-1 h-9 rounded-md border border-input px-3 py-1 text-sm bg-background uppercase"
                />
                <Button
                  type="button"
                  onClick={handleApplyVoucher}
                  disabled={voucherApplied}
                  variant="outline"
                  className="h-9"
                >
                  {voucherApplied ? 'Đã áp dụng' : 'Áp dụng'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Order details & summary sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-xs">
            <CardContent className="p-6 space-y-4">
              <Typography className="font-serif text-lg font-bold">
                Đơn hàng ({selectedCount} sản phẩm)
              </Typography>
              <Separator />

              {/* Items List */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {selectedItemsWithPrices.map((item) => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <div className="size-12 rounded overflow-hidden bg-muted border shrink-0">
                      <img src={rewriteImageUrl(item.image)} alt={item.name} className="size-full object-cover object-top" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <Typography className="font-semibold text-xs sm:text-sm line-clamp-1">{item.name}</Typography>
                      <div className="flex gap-2 text-[10px] text-muted-foreground">
                        {item.size && <span>Size: {item.size}</span>}
                        <span>SL: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Typography className="font-semibold text-xs mt-0.5">
                        {formatCurrency((checkoutMethod === 'BUY' ? item.purchasePrice : item.price * rentalDays) * item.quantity)}
                      </Typography>
                      <span className="text-[10px] text-muted-foreground block">
                        {checkoutMethod === 'BUY' ? 'Giá bán' : `Giá thuê (${rentalDays} ngày)`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />

              {/* Finance details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-semibold">{formatCurrency(selectedSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Giảm giá</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="font-semibold text-success">Miễn phí</span>
                </div>
                <Separator />
                <div className="flex justify-between items-end">
                  <span className="text-sm font-semibold">Tổng cộng</span>
                  <span className="text-destructive font-serif text-lg font-bold">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Placement button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-base py-5 font-bold uppercase mt-2"
                onClick={handlePlaceOrder}
              >
                {isSubmitting
                  ? (checkoutMethod === 'BUY' ? 'ĐANG đặt mua sản phẩm...' : 'ĐANG thuê sản phẩm...')
                  : (checkoutMethod === 'BUY' ? `Đặt mua sản phẩm • ${formatCurrency(totalAmount)}` : `Thuê sản phẩm • ${formatCurrency(totalAmount)}`)}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
