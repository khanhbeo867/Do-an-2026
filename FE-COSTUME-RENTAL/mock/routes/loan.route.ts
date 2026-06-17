import { addDays, differenceInCalendarDays, isSameDay, startOfDay } from 'date-fns'
import type { Application, Request, Response } from 'express'
import { getDb, queryCollection, queryRecord } from '../lib'
import { jwtMiddleware } from '../middleware'
import { getInventoryBySku, getItemDetail, getRequesterEmployeeId, nextCode, nowISO } from './workflow.helpers'

type InventoryStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'DISPOSED'

const depositTimers = new Map<number, NodeJS.Timeout>()

function normalizeMethod(method: unknown) {
  if (method === 'BORROW') return 'BORROW'
  if (method === 'RENT' || method === 'RENTAL') return 'RENT'
  return ''
}

function normalizeDueDate(value: unknown) {
  if (!value) return null
  const parsed = new Date(String(value))
  if (Number.isNaN(parsed.getTime())) return null
  return startOfDay(parsed)
}

function getTomorrowStart() {
  return startOfDay(addDays(new Date(), 1))
}

function getRentalDays(createdAt: unknown, dueDate: unknown) {
  if (!createdAt || !dueDate) return 0

  const createdStart = startOfDay(new Date(String(createdAt)))
  const dueStart = startOfDay(new Date(String(dueDate)))
  const diff = differenceInCalendarDays(dueStart, createdStart)

  return diff > 0 ? diff : 0
}

function recomputeLoanFinancials(loanCode: string, dueDateValue: string | null, createdAtValue: string | null) {
  const items = queryCollection('loan_form_items', {
    'loan_form_code:eq': loanCode,
  }) as any[]

  const rentalDays = getRentalDays(createdAtValue, dueDateValue)
  const totalRentalAmount = items.reduce((total, item) => {
    return total + Number(item?.rental_price_per_day ?? 0) * rentalDays
  }, 0)
  const totalItemPriceAmount = items.reduce((total, item) => {
    return total + Number(item?.item_price ?? 0)
  }, 0)

  return {
    rental_days: rentalDays,
    total_rental_amount: totalRentalAmount,
    total_item_price_amount: totalItemPriceAmount,
  }
}

function clearDepositTimer(id: number) {
  const timer = depositTimers.get(id)
  if (timer) {
    clearTimeout(timer)
    depositTimers.delete(id)
  }
}

function scheduleDepositTimeout(loanId: number, loanCode: string) {
  clearDepositTimer(loanId)

  const timer = setTimeout(
    () => {
      const db = getDb()
      const existing = db.get('loan_forms').find({ id: loanId }).value()

      if (!existing || existing.code !== loanCode) {
        clearDepositTimer(loanId)
        return
      }

      if (existing.status !== 'DEPOSIT_PENDING' || Number(existing.deposit_amount ?? 0) !== 0) {
        clearDepositTimer(loanId)
        return
      }

      const items = queryCollection('loan_form_items', {
        'loan_form_code:eq': existing.code,
      }) as any[]

      updateInventoryStatusBySkus(
        items.map((item) => String(item.sku)),
        'AVAILABLE'
      )

      db.get('loan_forms').find({ id: loanId }).assign({ status: 'CANCELED', updated_at: nowISO() }).write()
      clearDepositTimer(loanId)
    },
    1000 * 60 * 5
  )

  depositTimers.set(loanId, timer)
}

function buildLoanDetail(record: any) {
  const items = queryCollection('loan_form_items', {
    'loan_form_code:eq': record.code,
  }) as any[]

  const joinedItems = items.map((item) => {
    const inventory = getInventoryBySku(item.sku)
    const itemDetail = inventory ? getItemDetail(String(inventory.item_type), Number(inventory.item_id)) : null

    return {
      ...item,
      inventory,
      item_detail: itemDetail,
    }
  })

  const employee = queryRecord('employees', Number(record.created_by), {})
  const returns = queryCollection('return_forms', {
    'loan_form_code:eq': record.code,
  }) as any[]
  const penalties = queryCollection('penalty_forms', {
    'loan_form_code:eq': record.code,
  }) as any[]
  const invoices = queryCollection('invoices', {
    'loan_form_code:eq': record.code,
  }) as any[]

  return {
    ...record,
    created_by_employee: employee,
    items: joinedItems,
    return_forms: returns,
    penalty_forms: penalties,
    invoices,
  }
}

function createLoanItemsFromSkus(loanCode: string, skus: string[], createdBy: number | null) {
  const db = getDb()

  for (const rawSku of skus) {
    const sku = String(rawSku).trim()
    if (!sku) continue
    const inventory = getInventoryBySku(sku)
    if (!inventory) continue

    const exists = (
      queryCollection('loan_form_items', {
        'loan_form_code:eq': loanCode,
        'sku:eq': sku,
      }) as any[]
    )[0]

    if (exists) continue

    const itemDetail = getItemDetail(String(inventory.item_type), Number(inventory.item_id))
    const loanItemName = itemDetail?.name ?? sku
    const rentalPrice = Number(itemDetail?.rental_price_per_day ?? 0)

    db.get('loan_form_items')
      .insert({
        loan_form_code: loanCode,
        sku,
        loan_item_name: loanItemName,
        rental_price_per_day: rentalPrice,
        item_price: Number(itemDetail?.price ?? 0),
        inventory_id: inventory.id,
        item_id: inventory.item_id,
        item_type: inventory.item_type,
        warehouse_id: inventory.warehouse_id,
        size: inventory.size ?? null,
        is_returned: false,
        created_by: createdBy,
        is_active: true,
        created_at: nowISO(),
        updated_at: null,
      })
      .write()
  }
}

function updateInventoryStatusBySkus(skus: string[], status: InventoryStatus) {
  const db = getDb()
  const changedAt = nowISO()

  for (const rawSku of skus) {
    const sku = String(rawSku).trim()
    if (!sku) continue
    db.get('inventory').find({ sku }).assign({ status, updated_at: changedAt }).write()
  }
}

export function registerLoanRoutes(app: Application) {
  app.get('/api/loan-forms', jwtMiddleware, (req: Request, res: Response) => {
    const results = queryCollection('loan_forms', req.query, {
      transform: (record) => buildLoanDetail(record),
    })
    return res.status(200).json(results)
  })

  app.get('/api/loan-forms/:id', jwtMiddleware, (req: Request, res: Response) => {
    const record = queryRecord('loan_forms', Number(req.params.id), req.query)
    if (!record) {
      return res.status(404).json({ message: 'Loan form not found' })
    }
    return res.status(200).json(buildLoanDetail(record))
  })

  app.post('/api/loan-forms', jwtMiddleware, (req: Request, res: Response) => {
    const {
      borrower_name,
      borrower_phone,
      borrower_citizen_id_number,
      borrower_role,
      method,
      due_date,
      deposit_amount = 0,
      loan_items = [],
    } = req.body

    const normalizedMethod = normalizeMethod(method)
    const dueDate = normalizeDueDate(due_date)

    if (!borrower_name || !borrower_phone || !borrower_role || !normalizedMethod) {
      return res.status(400).json({
        message: 'borrower_name, borrower_phone, borrower_role and method are required',
      })
    }

    if (!dueDate) {
      return res.status(400).json({ message: 'due_date is required and must be a valid date' })
    }

    if (dueDate.getTime() < getTomorrowStart().getTime()) {
      return res.status(400).json({ message: 'due_date must be at least tomorrow' })
    }

    const db = getDb()
    const createdBy = Number(req.body.created_by ?? getRequesterEmployeeId(req) ?? 0)
    const code = nextCode('loan_forms', 'code', 'LF')
    const createdAt = nowISO()
    const normalizedDepositAmount = Number(deposit_amount ?? 0)
    const isRentalLoan = normalizedMethod === 'RENT'
    const initialStatus = isRentalLoan ? 'DEPOSIT_PENDING' : 'BORROWING'
    let createdSkus: string[] = []

    const created = db
      .get('loan_forms')
      .insert({
        code,
        borrower_name,
        borrower_phone,
        borrower_citizen_id_number: borrower_citizen_id_number ?? null,
        borrower_role,
        method: normalizedMethod,
        due_date: dueDate.toISOString(),
        deposit_amount: normalizedDepositAmount,
        rental_days: 0,
        total_rental_amount: 0,
        total_item_price_amount: 0,
        created_by: createdBy || null,
        status: initialStatus,
        is_active: true,
        created_at: createdAt,
        updated_at: null,
      })
      .write()

    if (Array.isArray(loan_items) && loan_items.length > 0) {
      const skus = loan_items.map((loanItem: { sku?: string }) => String(loanItem?.sku ?? '').trim()).filter(Boolean)
      createdSkus = skus

      if (skus.length > 0) {
        createLoanItemsFromSkus(code, skus, createdBy || null)
      }
    }

    const totals = recomputeLoanFinancials(code, dueDate.toISOString(), createdAt)
    const requiredDeposit = Number(totals.total_item_price_amount ?? 0)
    const nextStatus =
      isRentalLoan && requiredDeposit > 0 && normalizedDepositAmount >= requiredDeposit ? 'BORROWING' : initialStatus

    if (nextStatus === 'BORROWING' && createdSkus.length > 0) {
      updateInventoryStatusBySkus(createdSkus, 'RENTED')
    }

    db.get('loan_forms')
      .find({ id: created.id })
      .assign({ ...totals, status: nextStatus, updated_at: nowISO() })
      .write()

    if (isRentalLoan && nextStatus === 'DEPOSIT_PENDING' && normalizedDepositAmount === 0) {
      scheduleDepositTimeout(created.id, code)
    }

    const fresh = db.get('loan_forms').find({ id: created.id }).value()

    return res.status(201).json(buildLoanDetail(fresh))
  })

  app.patch('/api/loan-forms/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('loan_forms').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Loan form not found' })
    }

    const { id: _id, code, created_at, method, due_date, ...updateData } = req.body

    const patchData = { ...updateData } as Record<string, unknown>

    if (method !== undefined) {
      const normalizedMethod = normalizeMethod(method)
      if (!normalizedMethod) {
        return res.status(400).json({ message: 'method is invalid' })
      }
      patchData.method = normalizedMethod
    }

    if (due_date !== undefined) {
      const dueDate = normalizeDueDate(due_date)
      if (!dueDate) {
        return res.status(400).json({ message: 'due_date must be a valid date' })
      }

      if (dueDate.getTime() < getTomorrowStart().getTime()) {
        return res.status(400).json({ message: 'due_date must be at least tomorrow' })
      }

      patchData.due_date = dueDate.toISOString()
    }

    const updated = db
      .get('loan_forms')
      .find({ id })
      .assign({
        ...patchData,
        updated_at: nowISO(),
      })
      .write()

    const totals = recomputeLoanFinancials(updated.code, updated.due_date ?? null, updated.created_at ?? null)
    db.get('loan_forms')
      .find({ id })
      .assign({ ...totals, updated_at: nowISO() })
      .write()

    const fresh = db.get('loan_forms').find({ id }).value()

    return res.status(200).json(buildLoanDetail(fresh))
  })

  app.post('/api/loan-forms/:id/confirm-deposit', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('loan_forms').find({ id }).value()

    if (!existing) {
      return res.status(404).json({ message: 'Loan form not found' })
    }

    if (existing.method !== 'RENT') {
      return res.status(400).json({ message: 'Only rental loan forms can confirm deposit' })
    }

    const requiredDeposit = Number(existing.total_item_price_amount ?? 0)

    if (existing.status === 'BORROWING') {
      clearDepositTimer(id)
      const updatedBorrowing = db
        .get('loan_forms')
        .find({ id })
        .assign({
          deposit_amount: requiredDeposit,
          updated_at: nowISO(),
        })
        .write()
      return res.status(200).json(buildLoanDetail(updatedBorrowing))
    }

    if (existing.status !== 'DEPOSIT_PENDING') {
      return res.status(400).json({ message: 'Loan form is not awaiting deposit confirmation' })
    }

    const items = queryCollection('loan_form_items', {
      'loan_form_code:eq': existing.code,
    }) as any[]

    updateInventoryStatusBySkus(
      items.map((item) => String(item.sku)),
      'RENTED'
    )

    clearDepositTimer(id)

    const updated = db
      .get('loan_forms')
      .find({ id })
      .assign({
        deposit_amount: requiredDeposit,
        status: 'BORROWING',
        updated_at: nowISO(),
      })
      .write()
    return res.status(200).json(buildLoanDetail(updated))
  })

  app.delete('/api/loan-forms/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('loan_forms').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Loan form not found' })
    }

    if (req.query.permanantly && JSON.parse(String(req.query.permanantly))) {
      db.get('loan_forms').remove({ id }).write()
      db.get('loan_form_items').remove({ loan_form_code: existing.code }).write()
    } else {
      db.get('loan_forms').find({ id }).assign({ is_active: false, updated_at: nowISO() }).write()
    }

    return res.status(200).json({ message: 'Loan form deleted successfully' })
  })

  app.post('/api/loan-forms/:id/items', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('loan_forms').find({ id }).value()

    if (!existing) {
      return res.status(404).json({ message: 'Loan form not found' })
    }

    const skus = Array.isArray(req.body.skus) ? req.body.skus.map(String) : []
    if (!skus.length) {
      return res.status(400).json({ message: 'skus is required and must be a non-empty array' })
    }

    createLoanItemsFromSkus(existing.code, skus, getRequesterEmployeeId(req))

    if (existing.status === 'BORROWING') {
      updateInventoryStatusBySkus(skus, 'RENTED')
    }

    const totals = recomputeLoanFinancials(existing.code, existing.due_date ?? null, existing.created_at ?? null)
    db.get('loan_forms')
      .find({ id })
      .assign({ ...totals, updated_at: nowISO() })
      .write()

    const fresh = db.get('loan_forms').find({ id }).value()
    return res.status(200).json(buildLoanDetail(fresh))
  })

  app.patch('/api/loan-form-items/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('loan_form_items').find({ id }).value()

    if (!existing) {
      return res.status(404).json({ message: 'Loan form item not found' })
    }

    const { id: _id, created_at, loan_form_code, ...updateData } = req.body
    const updated = db
      .get('loan_form_items')
      .find({ id })
      .assign({ ...updateData, updated_at: nowISO() })
      .write()

    return res.status(200).json(updated)
  })

  app.delete('/api/loan-form-items/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('loan_form_items').find({ id }).value()

    if (!existing) {
      return res.status(404).json({ message: 'Loan form item not found' })
    }

    db.get('loan_form_items').remove({ id }).write()
    return res.status(200).json({ message: 'Loan form item deleted successfully' })
  })

  app.post('/api/loan-forms/:id/checkout', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('loan_forms').find({ id }).value()

    if (!existing) {
      return res.status(404).json({ message: 'Loan form not found' })
    }

    if (existing.status === 'CANCELED' || existing.status === 'RETURNED') {
      return res.status(400).json({ message: `Loan form cannot be checked out from status ${existing.status}` })
    }

    const items = queryCollection('loan_form_items', {
      'loan_form_code:eq': existing.code,
    }) as any[]
    if (!items.length) {
      return res.status(400).json({ message: 'Loan form has no items to checkout' })
    }

    const unavailable = items.find((item) => {
      const inventory = getInventoryBySku(String(item.sku))
      return !inventory || inventory.status !== 'AVAILABLE'
    })

    if (unavailable) {
      return res.status(400).json({ message: `Inventory sku ${unavailable.sku} is not AVAILABLE` })
    }

    updateInventoryStatusBySkus(
      items.map((item) => String(item.sku)),
      'RENTED'
    )

    const updated = db.get('loan_forms').find({ id }).assign({ status: 'BORROWING', updated_at: nowISO() }).write()
    return res.status(200).json(buildLoanDetail(updated))
  })

  app.post('/api/loan-forms/:id/cancel', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('loan_forms').find({ id }).value()

    if (!existing) {
      return res.status(404).json({ message: 'Loan form not found' })
    }

    if (existing.status === 'RETURNED') {
      return res.status(400).json({ message: 'Returned loan forms cannot be canceled' })
    }

    if (!existing.created_at || !isSameDay(new Date(existing.created_at), new Date())) {
      return res.status(400).json({ message: 'Loan forms can only be canceled on the created date' })
    }

    const items = queryCollection('loan_form_items', {
      'loan_form_code:eq': existing.code,
    }) as any[]
    updateInventoryStatusBySkus(
      items.map((item) => String(item.sku)),
      'AVAILABLE'
    )

    clearDepositTimer(id)

    const updated = db.get('loan_forms').find({ id }).assign({ status: 'CANCELED', updated_at: nowISO() }).write()
    return res.status(200).json(buildLoanDetail(updated))
  })
}
