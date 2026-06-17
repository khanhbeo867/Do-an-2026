import { useGetInvoicesQuery } from '@/apis/invoice/hooks/use-invoice-request'
import type { IInvoice, PaymentMethod } from '@/apis/invoice/types'
import { ColumnViewOptions } from '@/components/shared/data-grid/components/column-view-options'
import GlobalFilterInput from '@/components/shared/data-grid/components/global-filter-input'
import { DataTableFacetedFilter } from '@/components/shared/data-grid/components/table-faceted-filter'
import { Tooltip } from '@/components/shared/tooltip'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import useMediaQuery from '@/hooks/use-media-query'
import tw from '@/lib/tw'
import { useRouter } from '@tanstack/react-router'
import type { Table } from '@tanstack/react-table'
import type { EventEmitter } from 'ahooks/lib/useEventEmitter'
import { useMemo } from 'react'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const PAYMENT_METHOD_OPTIONS: { label: string; value: PaymentMethod }[] = [
  { label: 'Tiền mặt', value: 'CASH' },
  { label: 'Chuyển khoản', value: 'BANK_TRANSFER' },
]

const InvoiceTableToolbar: React.FC<{
  table: Table<IInvoice>
  event$: EventEmitter<Record<string, unknown>>
}> = ({ table }) => {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const { data, refetch, isRefetching } = useGetInvoicesQuery()
  const router = useRouter()
  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter

  const payerOptions = useMemo(() => {
    return Array.from(
      new Set((data ?? []).map((item) => item.payer_name).filter((name): name is string => Boolean(name)))
    ).map((name) => ({
      label: name,
      value: name,
    }))
  }, [data])

  const monthOptions = useMemo(() => {
    const months = Array.from(
      new Set(
        (data ?? [])
          .map((item) => {
            const date = item.created_at ? new Date(item.created_at) : null
            return date ? format(date, 'MM/yyyy') : null
          })
          .filter(Boolean)
      )
    ) as string[]

    months.sort((a, b) => {
      const [mA, yA] = a.split('/').map(Number)
      const [mB, yB] = b.split('/').map(Number)
      if (yA !== yB) return yB - yA
      return mB - mA
    })

    return months.map((m) => ({
      label: m,
      value: m,
    }))
  }, [data])

  return (
    <Toolbar>
      <ToolbarGroup className="md:flex-1 md:basis-full">
        <GlobalFilterInput table={table} />
        {table.getColumn('month') && (
          <Select
            value={(table.getColumn('month')?.getFilterValue() as string[])?.[0] || 'all'}
            onValueChange={(val) => {
              table.getColumn('month')?.setFilterValue(val === 'all' ? undefined : [val])
            }}
          >
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Tất cả tháng" />
            </SelectTrigger>
            <SelectContent className="w-[160px] h-fit">
              <SelectItem value="all">Tất cả tháng</SelectItem>
              {monthOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {table.getColumn('payer_name') && (
          <DataTableFacetedFilter
            column={table.getColumn('payer_name')}
            title="Người thanh toán"
            options={payerOptions}
          />
        )}
        {table.getColumn('payment_method') && (
          <DataTableFacetedFilter
            column={table.getColumn('payment_method')}
            title="Phương thức thanh toán"
            options={PAYMENT_METHOD_OPTIONS}
          />
        )}
        {isFiltered && (
          <Tooltip
            message="Bỏ lọc"
            triggerProps={{
              render: (
                <Button
                  variant="secondary"
                  size={isMobile ? 'icon' : 'default'}
                  onClick={() => {
                    table.resetGlobalFilter()
                    table.resetColumnFilters()
                  }}
                >
                  {!isMobile && 'Bỏ lọc'} <Icon name="FunnelX" />
                </Button>
              ),
            }}
            contentProps={{ hidden: !isMobile }}
          />
        )}
      </ToolbarGroup>
      <ToolbarGroup className="ml-auto">
        <Tooltip
          message="Tải lại"
          contentProps={{ hidden: !isMobile }}
          triggerProps={{
            render: (
              <Button
                className={!isMobile ? 'bg-background' : undefined}
                variant={isMobile ? 'ghost' : 'outline'}
                size={isMobile ? 'icon' : 'default'}
                disabled={isRefetching}
                onClick={() => refetch().then(() => router.invalidate())}
              >
                <Icon name="RefreshCcw" className={isRefetching ? 'animate-spin' : undefined} />
                {!isMobile && 'Tải lại'}
              </Button>
            ),
          }}
        />
        <ColumnViewOptions />
      </ToolbarGroup>
    </Toolbar>
  )
}

const Toolbar: React.FC<React.ComponentProps<'div'>> = tw.div`flex items-stretch justify-between gap-x-2`
const ToolbarGroup: React.FC<React.ComponentProps<'div'>> = tw.div`flex items-center gap-x-2`

export default InvoiceTableToolbar
