export type StatisticsRange = 'today' | '7d' | '30d' | 'month'
export type StatisticsMethod = 'ALL' | 'BORROW' | 'RENT'

export interface IStatisticsOverview {
  revenue: number
  newOrders: number
  onTimeRate: number
  overdueOrders: number
}

export interface IStatisticsTrendingPoint {
  date: string
  revenue: number
  newOrders: number
}

export interface IStatisticsAlertDueToday {
  id: number
  code: string
  borrower_name: string
  borrower_phone: string
  method: string
  due_date: string
  status: string
}

export interface IStatisticsTopRow {
  sku: string
  name: string
  count: number
}

export interface IStatisticsResponse {
  filters: {
    range: StatisticsRange
    method: StatisticsMethod
    from: string
    to: string
  }
  overviews: IStatisticsOverview
  trendings: {
    revenueAndOrders: IStatisticsTrendingPoint[]
  }
  alerts: {
    dueToday: IStatisticsAlertDueToday[]
  }
  topList: {
    mostRented: IStatisticsTopRow[]
    leastRented: IStatisticsTopRow[]
  }
}

export interface IStatisticsQueryParams {
  range?: StatisticsRange
  method?: StatisticsMethod
}
