import { useGetStatisticsQuery } from '@/apis/statistics/hooks/use-statistics-request'
import type { IStatisticsAlertDueToday, IStatisticsTopRow, StatisticsRange } from '@/apis/statistics/types'
import { PageAction, PageHeader, PageSeparator, PageTitle, PageWrapper } from '@/components/layouts/app/app-page'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePageHelperText } from '@/hooks/use-page-helper-text'
import { cn } from '@/lib/utils'
import { Link, useHydrated } from '@tanstack/react-router'
import { Clock3Icon, ReceiptTextIcon, RefreshCwIcon, ShieldAlertIcon, WalletIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

const chartConfig = {
  revenue: { label: 'Doanh thu', color: 'var(--chart-1)' },
  newOrders: { label: 'Đơn mới', color: 'var(--chart-2)' },
} satisfies ChartConfig

const rangeOptions: Array<{ key: StatisticsRange; label: string }> = [
  { key: 'today', label: 'Hôm nay' },
  { key: '7d', label: '7 ngày' },
  { key: '30d', label: '30 ngày' },
  { key: 'month', label: 'Tháng này' },
]

const rangeLabelMap: Record<StatisticsRange, string> = {
  today: 'Hôm nay',
  '7d': '7 ngày gần nhất',
  '30d': '30 ngày gần nhất',
  month: 'Tháng này',
}

const formatIntegerVi = (value: number) => {
  const integer = Number.isFinite(value) ? Math.trunc(value) : 0
  return integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const formatVnd = (value: number) => `${formatIntegerVi(value)} đ`

const formatDateDdMmYyyy = (value?: string) => {
  if (!value) return '-'

  const matched = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!matched) return '-'

  const [, year, month, day] = matched
  return `${day}/${month}/${year}`
}

const StatisticsPage: React.FC = () => {
  const { title } = usePageHelperText('main')
  const hydrated = useHydrated()
  const [range, setRange] = useState<StatisticsRange>('7d')

  const queryParams = useMemo(() => ({ range, method: 'ALL' as const }), [range])
  const { data, isFetching, refetch } = useGetStatisticsQuery(queryParams)

  const overviews = data.overviews
  const trendings = data.trendings.revenueAndOrders
  const dueToday = data.alerts.dueToday
  const mostRented = data.topList.mostRented
  const leastRented = data.topList.leastRented
  const isRefreshing = hydrated && isFetching

  return (
    <PageWrapper>
      <PageHeader className="md:grid-cols-[1fr_auto] md:grid-flow-row">
        <PageTitle>{title}</PageTitle>
        <PageAction>
          <Button variant="outline" onClick={() => refetch()} disabled={isRefreshing}>
            <RefreshCwIcon className={cn('size-4', isRefreshing && 'animate-spin')} />
            Tải lại dữ liệu
          </Button>
        </PageAction>
      </PageHeader>

      <PageSeparator />

      <Card size="sm" className="gap-3 py-4">
        <CardContent className="flex items-center justify-between gap-3">
          <Tabs value={range} onValueChange={(value) => setRange(value as StatisticsRange)}>
            <TabsList className="grid grid-cols-4">
              {rangeOptions.map((option) => (
                <TabsTrigger key={option.key} value={option.key}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <span className="text-muted-foreground text-sm">Khoảng lọc: {rangeLabelMap[range]}</span>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link to="/invoices">
          <KpiCard
            title="Doanh thu"
            value={formatVnd(overviews.revenue)}
            hint={rangeLabelMap[range]}
            icon={<WalletIcon className="size-4" />}
          />
        </Link>
        <Link to="/loan-forms">
          <KpiCard
            title="Đơn mới"
            value={formatIntegerVi(overviews.newOrders)}
            hint={rangeLabelMap[range]}
            icon={<ReceiptTextIcon className="size-4" />}
          />
        </Link>
        <Link to="/return-forms">
          <KpiCard
            title="Tỷ lệ trả đúng hạn"
            value={`${overviews.onTimeRate.toFixed(1)}%`}
            hint="Tính trên phiếu trả đã hoàn tất"
            icon={<Clock3Icon className="size-4" />}
          />
        </Link>
        <Link to="/return-forms">
          <KpiCard
            title="Đơn quá hạn"
            value={formatIntegerVi(overviews.overdueOrders)}
            hint="Đơn đang quá hạn theo ngày"
            icon={<ShieldAlertIcon className="size-4" />}
          />
        </Link>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng doanh thu và đơn mới</CardTitle>
            <CardDescription>Dữ liệu theo ngày trong khoảng lọc hiện tại</CardDescription>
          </CardHeader>
          <CardContent>
            {hydrated ? (
              <ChartContainer config={chartConfig} className="h-80 w-full">
                <AreaChart data={trendings}>
                  <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey="revenue"
                    name="Doanh thu"
                    type="natural"
                    stroke="var(--color-revenue)"
                    fillOpacity={1}
                    fill="url(#fillRevenue)"
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="newOrders"
                    name="Đơn mới"
                    type="monotone"
                    stroke="var(--color-newOrders)"
                    fill="none"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="text-muted-foreground flex h-80 w-full items-center justify-center rounded-md border border-dashed text-sm">
                Đang chuẩn bị biểu đồ...
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cảnh báo đơn đến hạn phải trả</CardTitle>
            <CardDescription>Ngày trả = ngày hôm nay</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertList title="Đơn đến hạn hôm nay" rows={dueToday} />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <Link to="/loan-forms" className="hover:underline">
              <CardTitle>Top danh sách sản phẩm</CardTitle>
            </Link>
            <CardDescription>Top 5 sản phẩm thuê/mua nhiều nhất và ít nhất trong khoảng lọc</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 xl:grid-cols-2">
            <TopSkuList title="5 sản phẩm thuê/mua nhiều nhất" rows={mostRented} tone="success" />
            <TopSkuList title="5 sản phẩm thuê/mua ít nhất" rows={leastRented} tone="warning" />
          </CardContent>
        </Card>
      </section>
    </PageWrapper>
  )
}

type KpiCardProps = {
  title: string
  value: string
  hint: string
  icon: React.ReactNode
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, hint, icon }) => (
  <Card size="sm">
    <CardHeader className="flex flex-row items-center justify-between gap-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <span className="text-muted-foreground">{icon}</span>
    </CardHeader>
    <CardContent className="space-y-1">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-muted-foreground text-xs">{hint}</p>
    </CardContent>
  </Card>
)

type AlertListProps = {
  title: string
  rows: IStatisticsAlertDueToday[]
}

const AlertList: React.FC<AlertListProps> = ({ title, rows }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge variant="outline">{rows.length}</Badge>
      </div>

      {rows.length === 0 ? (
        <div className="text-muted-foreground rounded-md border border-dashed p-3 text-sm">Không có cảnh báo.</div>
      ) : (
        rows.map((row) => {
          const dueDate = formatDateDdMmYyyy(row.due_date)

          return (
            <div
              key={row.id}
              className="grid gap-2 rounded-md border p-3 text-sm md:grid-cols-[1fr_auto] md:items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">#{row.code}</span>
                  <Badge variant="outline">{row.method === 'BUY' ? 'Mua' : 'Thuê'}</Badge>
                </div>
                <p className="text-muted-foreground">Khách: {row.borrower_name}</p>
                <p className="text-muted-foreground">Hạn trả: {dueDate}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="destructive">Đến hạn hôm nay</Badge>
                <Link to="/loan-forms" className="text-primary text-xs underline underline-offset-2">
                  Mở danh sách
                </Link>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

type TopSkuListProps = {
  title: string
  rows: IStatisticsTopRow[]
  tone: 'success' | 'warning'
}

const TopSkuList: React.FC<TopSkuListProps> = ({ title, rows, tone }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <div className="text-muted-foreground rounded-md border border-dashed p-3 text-sm">Không có dữ liệu.</div>
      ) : (
        rows.map((row) => (
          <div key={row.sku} className="flex items-center justify-between rounded-md border p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{row.name}</p>
              <p className="text-muted-foreground truncate text-xs">SKU: {row.sku}</p>
            </div>
            <Badge variant={tone === 'success' ? 'default' : 'secondary'}>{row.count} lượt</Badge>
          </div>
        ))
      )}
    </div>
  )
}

export default StatisticsPage
