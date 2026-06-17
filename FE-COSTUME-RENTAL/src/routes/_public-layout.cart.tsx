import { getAuthUserQueryOptions } from '@/apis/auth/hooks/use-auth-request'
import { formatCurrency } from '@/common/helpers/format-intl'
import { rewriteImageUrl } from '@/common/helpers/image-url'
import Image from '@/components/shared/image'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { useCartStore } from '@/hooks/use-cart-store'
import { cn } from '@/lib/utils'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_public-layout/cart')({
  head: () => ({
    meta: [
      { title: 'Đơn hàng của tôi' },
      {
        name: 'description',
        content: 'Xem và quản lý các trang phục, đạo cụ đã thêm vào đơn hàng trước khi thanh toán.',
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
  component: CartPage,
})

function CartPage() {
  const { items, updateQuantity, removeItem, toggleSelect, toggleSelectAll } = useCartStore()

  const allSelected = items.length > 0 && items.every((item) => item.selected)
  const selectedItems = items.filter((item) => item.selected)
  const selectedCount = selectedItems.reduce((acc, item) => acc + item.quantity, 0)
  const selectedSubtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shippingFee = 0 // Standard shipping is free
  const totalAmount = selectedSubtotal + shippingFee

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-6">
      <Typography as="h1" variant="h1" className="font-serif text-2xl md:text-3xl">
        Giỏ hàng
      </Typography>

      {items.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <Typography className="text-muted-foreground">Giỏ hàng của bạn đang trống.</Typography>
          <Link to="/products" className={cn(buttonVariants({ variant: 'default' }))}>
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Cart items list */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 pb-4 border-b bg-card p-4 rounded-md shadow-xs">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                id="select-all"
              />
              <Label htmlFor="select-all" className="font-semibold text-sm cursor-pointer select-none">
                Chọn tất cả ({items.length} sản phẩm)
              </Label>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-4 bg-card rounded-md shadow-xs border border-border/40"
                >
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={() => toggleSelect(item.id)}
                    id={`select-${item.id}`}
                  />
                  <div className="size-16 sm:size-20 shrink-0 rounded overflow-hidden bg-muted border">
                    <Image
                      src={rewriteImageUrl(item.image)}
                      alt={item.name}
                      className="size-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <Typography className="font-semibold text-sm sm:text-base line-clamp-1">
                      {item.name}
                    </Typography>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      {item.size && (
                        <span className="bg-muted px-2 py-0.5 rounded font-medium">Size: {item.size}</span>
                      )}
                      <span className="bg-muted px-2 py-0.5 rounded font-medium capitalize">
                        {item.type === 'costume' ? 'Trang phục' : 'Đạo cụ'}
                      </span>
                    </div>
                    <Typography className="text-primary font-bold text-sm">
                      {formatCurrency(item.price)} / ngày
                    </Typography>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0">
                    {/* Quantity controls */}
                    <div className="flex items-center border rounded">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="size-7 flex items-center justify-center text-xs font-semibold hover:bg-muted disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="size-7 flex items-center justify-center text-xs font-semibold hover:bg-muted"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        removeItem(item.id)
                        toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
                      }}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout summary panel */}
          <div className="lg:col-span-4">
            <Card className="shadow-xs border-border/60">
              <CardContent className="p-6 space-y-4">
                <Typography className="font-serif text-lg font-bold">Tóm tắt đơn hàng</Typography>
                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sản phẩm đã chọn ({selectedCount})</span>
                  <span className="font-semibold">{formatCurrency(selectedSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-semibold">{formatCurrency(selectedSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="font-semibold text-success">Miễn phí</span>
                </div>
                <Separator />

                <div className="flex justify-between items-end">
                  <span className="text-sm font-semibold">Tổng cộng</span>
                  <span className="text-destructive font-serif text-xl font-bold">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <Link
                  to="/checkout"
                  disabled={selectedItems.length === 0}
                  className={cn(
                    buttonVariants({ variant: 'default', size: 'lg' }),
                    "w-full text-base",
                    selectedItems.length === 0 && "pointer-events-none opacity-50"
                  )}
                >
                  Thuê/Mua sản phẩm
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
