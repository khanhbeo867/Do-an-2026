import { endOfDay, endOfMonth, format, isSameDay, isWithinInterval, startOfDay, startOfMonth, subDays } from 'date-fns'
import type { Application, Request, Response } from 'express'
import { getDb } from '../lib'
import { jwtMiddleware } from '../middleware'

type StatisticsRange = 'today' | '7d' | '30d' | 'month'
type StatisticsMethod = 'ALL' | 'BORROW' | 'RENT'

type TimeRange = {
  start: Date
  end: Date
}

const ACTIVE_LOAN_STATUSES = new Set(['BORROWING', 'DEPOSIT_PENDING'])

const toDate = (value?: string | null) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const normalizeRange = (value: unknown): StatisticsRange => {
  switch (String(value ?? '').toLowerCase()) {
    case 'today':
      return 'today'
    case '30d':
      return '30d'
    case 'month':
      return 'month'
    case '7d':
    default:
      return '7d'
  }
}

const normalizeMethod = (value: unknown): StatisticsMethod => {
  switch (String(value ?? '').toUpperCase()) {
    case 'BORROW':
      return 'BORROW'
    case 'RENT':
      return 'RENT'
    case 'ALL':
    default:
      return 'ALL'
  }
}

const getTimeRange = (range: StatisticsRange, now = new Date()): TimeRange => {
  switch (range) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case '30d':
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) }
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case '7d':
    default:
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) }
  }
}

const inRange = (value: string | null | undefined, range: TimeRange) => {
  const date = toDate(value)
  if (!date) return false
  return isWithinInterval(date, range)
}

export function registerStatisticsRoutes(app: Application) {
  app.get('/api/statistics', jwtMiddleware, (req: Request, res: Response) => {
    const range = normalizeRange(req.query.range)
    const method = normalizeMethod(req.query.method)
    const now = new Date()
    const today = startOfDay(now)
    const timeRange = getTimeRange(range, now)

    const db = getDb()

    const loans = db.get('loan_forms').value() as any[]
    const returns = db.get('return_forms').value() as any[]
    const invoices = db.get('invoices').value() as any[]
    const loanItems = db.get('loan_form_items').value() as any[]

    const loanByCode = new Map(loans.map((loan) => [String(loan.code), loan]))
    const returnByCode = new Map(returns.map((form) => [String(form.code), form]))

    const isAllowedMethod = (loanMethod?: string | null) => {
      if (method === 'ALL') return true
      return String(loanMethod ?? '').toUpperCase() === method
    }

    const resolveLoanFromInvoice = (invoice: any) => {
      if (invoice?.loan_form_code) return loanByCode.get(String(invoice.loan_form_code)) ?? null

      if (invoice?.return_form_code) {
        const returnForm = returnByCode.get(String(invoice.return_form_code))
        if (returnForm?.loan_form_code) {
          return loanByCode.get(String(returnForm.loan_form_code)) ?? null
        }
      }

      return null
    }

    const filteredLoansInRange = loans.filter(
      (loan) => isAllowedMethod(loan.method) && inRange(loan.created_at, timeRange)
    )

    const paidRentalInvoices = invoices.filter((invoice) => {
      if (String(invoice.status) !== 'PAID') return false
      if (!inRange(invoice.paid_at ?? invoice.created_at, timeRange)) return false

      const loan = resolveLoanFromInvoice(invoice)
      if (loan) return isAllowedMethod(loan.method)

      // fallback if invoice has rental_amount > 0 but no relation join available
      if (method === 'ALL') return Number(invoice.rental_amount ?? 0) > 0
      return method === 'RENT' && Number(invoice.rental_amount ?? 0) > 0
    })

    const revenue = paidRentalInvoices.reduce((sum, invoice) => sum + Number(invoice.payment_amount ?? 0), 0)

    const newOrders = filteredLoansInRange.filter((loan) => ACTIVE_LOAN_STATUSES.has(String(loan.status))).length

    const returnedInRange = returns
      .map((returnForm) => {
        const loan = loanByCode.get(String(returnForm.loan_form_code))
        const returnDate = toDate(returnForm.created_at)
        const dueDate = toDate(loan?.due_date)

        return {
          status: String(returnForm.status),
          method: String(loan?.method ?? returnForm.method ?? ''),
          returnDate,
          dueDate,
        }
      })
      .filter((record) => {
        return (
          record.status === 'RETURNED' &&
          record.returnDate &&
          record.dueDate &&
          isWithinInterval(record.returnDate, timeRange) &&
          isAllowedMethod(record.method)
        )
      })

    const onTimeCount = returnedInRange.filter(
      (record) => endOfDay(record.returnDate!).getTime() <= endOfDay(record.dueDate!).getTime()
    ).length
    const onTimeRate = returnedInRange.length ? (onTimeCount / returnedInRange.length) * 100 : 0

    const overdueOrders = loans.filter((loan) => {
      if (!isAllowedMethod(loan.method)) return false
      if (!ACTIVE_LOAN_STATUSES.has(String(loan.status))) return false
      const dueDate = toDate(loan.due_date)
      return Boolean(dueDate && startOfDay(dueDate).getTime() < today.getTime())
    }).length

    const dailyPoints: Array<{ date: string; revenue: number; newOrders: number }> = []
    for (let cursor = new Date(timeRange.start); cursor <= timeRange.end; cursor = subDays(cursor, -1)) {
      const dayStart = startOfDay(cursor)
      const dayEnd = endOfDay(cursor)

      const dayRevenue = paidRentalInvoices
        .filter((invoice) => {
          const paidDate = toDate(invoice.paid_at ?? invoice.created_at)
          return Boolean(paidDate && isWithinInterval(paidDate, { start: dayStart, end: dayEnd }))
        })
        .reduce((sum, invoice) => sum + Number(invoice.payment_amount ?? 0), 0)

      const dayOrders = loans.filter((loan) => {
        const createdAt = toDate(loan.created_at)
        return Boolean(
          createdAt &&
          isWithinInterval(createdAt, { start: dayStart, end: dayEnd }) &&
          isAllowedMethod(loan.method) &&
          ACTIVE_LOAN_STATUSES.has(String(loan.status))
        )
      }).length

      dailyPoints.push({
        date: format(dayStart, 'dd/MM'),
        revenue: dayRevenue,
        newOrders: dayOrders,
      })
    }

    const dueToday = loans
      .filter((loan) => {
        if (!isAllowedMethod(loan.method)) return false
        if (!ACTIVE_LOAN_STATUSES.has(String(loan.status))) return false
        const dueDate = toDate(loan.due_date)
        return Boolean(dueDate && isSameDay(dueDate, today))
      })
      .map((loan) => ({
        id: Number(loan.id),
        code: String(loan.code),
        borrower_name: String(loan.borrower_name ?? ''),
        borrower_phone: String(loan.borrower_phone ?? ''),
        method: String(loan.method),
        due_date: String(loan.due_date ?? ''),
        status: String(loan.status),
      }))

    const filteredLoanCodes = new Set(filteredLoansInRange.map((loan) => String(loan.code)))

    const skuCount = new Map<string, { sku: string; name: string; count: number }>()
    loanItems.forEach((item) => {
      const code = String(item.loan_form_code)
      if (!filteredLoanCodes.has(code)) return

      const sku = String(item.sku)
      const row = skuCount.get(sku) ?? {
        sku,
        name: String(item.loan_item_name ?? sku),
        count: 0,
      }
      row.count += 1
      skuCount.set(sku, row)
    })

    const ranked = Array.from(skuCount.values()).sort((a, b) => b.count - a.count)

    return res.status(200).json({
      filters: {
        range,
        method,
        from: timeRange.start.toISOString(),
        to: timeRange.end.toISOString(),
      },
      overviews: {
        revenue,
        newOrders,
        onTimeRate,
        overdueOrders,
      },
      trendings: {
        revenueAndOrders: dailyPoints,
      },
      alerts: {
        dueToday,
      },
      topList: {
        mostRented: ranked.slice(0, 5),
        leastRented: [...ranked].reverse().slice(0, 5),
      },
    })
  })
}
