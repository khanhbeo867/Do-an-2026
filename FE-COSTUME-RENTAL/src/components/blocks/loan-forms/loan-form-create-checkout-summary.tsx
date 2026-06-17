import { formatCurrency } from '@/common/helpers/format-intl'
import { Badge } from '@/components/ui/badge'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { differenceInCalendarDays, startOfDay } from 'date-fns'
import React from 'react'
import type { TLoanItemRow } from './loan-form-create.constants'

type LoanFormCreateCheckoutSummaryProps = {
  methodValue: string
  methodLabel: string
  borrowerName: string
  borrowerPhone: string
  borrowerCitizenId: string
  dueDate: string
  depositAmount: number
  loanItems: TLoanItemRow[]
}

function LoanFormCreateCheckoutSummaryComponent({
  methodValue,
  methodLabel,
  borrowerName,
  borrowerPhone,
  borrowerCitizenId,
  dueDate,
  depositAmount,
  loanItems,
}: LoanFormCreateCheckoutSummaryProps) {
  const dueDateText = dueDate ? new Date(dueDate).toLocaleDateString('vi-VN') : '-'
  const rentalDays = dueDate
    ? Math.max(0, differenceInCalendarDays(startOfDay(new Date(dueDate)), startOfDay(new Date())))
    : 0
  const totalRentalAmount = loanItems.reduce((total, loanItem) => {
    return total + Number(loanItem.item.rental_price_per_day ?? 0) * rentalDays
  }, 0)
  const totalItemPriceAmount = loanItems.reduce((total, loanItem) => {
    return total + Number(loanItem.item.price ?? 0)
  }, 0)

  return (
    <div className="space-y-4">
      <ItemGroup className="rounded-lg border p-4 grid grid-cols-2 [&_div[data-slot=item]]:p-0">
        <Item className="col-span-full">
          <ItemContent>
            <ItemDescription className="text-sm text-muted-foreground">Loại phiếu</ItemDescription>
            <ItemTitle>{methodLabel}</ItemTitle>
          </ItemContent>
        </Item>
        <Item>
          <ItemContent>
            <ItemDescription>{methodValue === 'BUY' ? 'Người mua' : 'Người thuê'}</ItemDescription>
            <ItemTitle>{borrowerName}</ItemTitle>
          </ItemContent>
        </Item>
        <Item>
          <ItemContent>
            <ItemDescription>Số điện thoại</ItemDescription>
            <ItemTitle>{borrowerPhone}</ItemTitle>
          </ItemContent>
        </Item>
        <Item>
          <ItemContent>
            <ItemDescription>CCCD</ItemDescription>
            <ItemTitle>{borrowerCitizenId || '-'}</ItemTitle>
          </ItemContent>
        </Item>
        {methodValue !== 'BUY' && (
          <Item>
            <ItemContent>
              <ItemDescription>Ngày hẹn trả</ItemDescription>
              <ItemTitle>{dueDateText}</ItemTitle>
            </ItemContent>
          </Item>
        )}
        {methodValue !== 'BUY' && (
          <Item>
            <ItemContent>
              <ItemDescription>Tiền đặt cọc</ItemDescription>
              <ItemTitle>{formatCurrency(Number(depositAmount ?? 0))}</ItemTitle>
            </ItemContent>
          </Item>
        )}
        {methodValue === 'BUY' && (
          <Item className="col-span-full">
            <ItemContent>
              <ItemDescription>Tổng tiền mua sản phẩm</ItemDescription>
              <ItemTitle className="text-xl text-primary font-bold">{formatCurrency(totalItemPriceAmount)}</ItemTitle>
            </ItemContent>
          </Item>
        )}
        {methodValue === 'RENT' ? (
          <>
            <Item>
              <ItemContent>
                <ItemDescription>Tổng số ngày thuê</ItemDescription>
                <ItemTitle>{rentalDays} ngày</ItemTitle>
              </ItemContent>
            </Item>
            <Item>
              <ItemContent>
                <ItemDescription>Tổng tiền thuê</ItemDescription>
                <ItemTitle>{formatCurrency(totalRentalAmount)}</ItemTitle>
              </ItemContent>
            </Item>
            <Item className="col-span-full">
              <ItemContent>
                <ItemDescription>Tổng tiền khách cần cọc (theo giá sản phẩm)</ItemDescription>
                <ItemTitle>{formatCurrency(totalItemPriceAmount)}</ItemTitle>
              </ItemContent>
            </Item>
          </>
        ) : null}
      </ItemGroup>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="text-sm text-muted-foreground">Danh sách sản phẩm đã thêm</div>
        {loanItems.map((loanItem, index) => (
          <Item key={`checkout-item-${index}`} size="xs" variant="outline">
            <ItemContent>
              <ItemTitle>{loanItem.item.sku}</ItemTitle>
              <ItemDescription className="inline-flex items-center gap-2">
                {loanItem.item.name} <Separator orientation="vertical" />{' '}
                {formatCurrency(Number(loanItem.item.rental_price_per_day ?? 0))} / ngày
              </ItemDescription>
            </ItemContent>
            <ItemContent>
              <ItemActions>
                <Badge variant="secondary">{loanItem.item_type.label}</Badge>
              </ItemActions>
            </ItemContent>
          </Item>
        ))}
      </div>
    </div>
  )
}

export const LoanFormCreateCheckoutSummary = React.memo(LoanFormCreateCheckoutSummaryComponent)
