import type { Application, Request, Response } from 'express'
import { getDb, queryCollection, queryRecord } from '../lib'
import { jwtMiddleware } from '../middleware'
import {
  getInventoryBySku,
  getItemDetail,
  getRequesterEmployeeId,
  nextCode,
  nowISO,
  toConditionId,
} from './workflow.helpers'

type InventoryStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'DISPOSED'

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

function buildReturnDetail(record: any) {
  const items = queryCollection('return_form_items', {
    'return_form_code:eq': record.code,
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
  const loan = (
    queryCollection('loan_forms', {
      'code:eq': record.loan_form_code,
    }) as any[]
  )[0]
  const penalties = queryCollection('penalty_forms', {
    'return_form_code:eq': record.code,
  }) as any[]
  const invoices = queryCollection('invoices', {
    'return_form_code:eq': record.code,
  }) as any[]

  return {
    ...record,
    created_by_employee: employee,
    loan_form: loan ? buildLoanDetail(loan) : null,
    items: joinedItems,
    penalty_forms: penalties,
    invoices,
  }
}

function createReturnItemsFromSkus(returnCode: string, skus: string[], createdBy: number | null) {
  const db = getDb()

  for (const rawSku of skus) {
    const sku = String(rawSku).trim()
    if (!sku) continue
    const inventory = getInventoryBySku(sku)
    if (!inventory) continue

    const exists = (
      queryCollection('return_form_items', {
        'return_form_code:eq': returnCode,
        'sku:eq': sku,
      }) as any[]
    )[0]

    if (exists) continue

    const itemDetail = getItemDetail(String(inventory.item_type), Number(inventory.item_id))

    db.get('return_form_items')
      .insert({
        return_form_code: returnCode,
        sku,
        return_item_name: itemDetail?.name ?? sku,
        rental_price_per_day: Number(itemDetail?.rental_price_per_day ?? 0),
        condition_on_return: 'GOOD',
        inventory_id: inventory.id,
        item_id: inventory.item_id,
        item_type: inventory.item_type,
        warehouse_id: inventory.warehouse_id,
        size: inventory.size ?? null,
        created_by: createdBy,
        is_active: true,
        created_at: nowISO(),
        updated_at: null,
      })
      .write()
  }
}

export function registerReturnRoutes(app: Application) {
  app.get('/api/return-forms', jwtMiddleware, (req: Request, res: Response) => {
    const results = queryCollection('return_forms', req.query, {
      transform: (record) => buildReturnDetail(record),
    })
    return res.status(200).json(results)
  })

  app.get('/api/return-forms/:id', jwtMiddleware, (req: Request, res: Response) => {
    const record = queryRecord('return_forms', Number(req.params.id), req.query)
    if (!record) {
      return res.status(404).json({ message: 'Return form not found' })
    }
    return res.status(200).json(buildReturnDetail(record))
  })

  app.post('/api/return-forms', jwtMiddleware, (req: Request, res: Response) => {
    const {
      loan_form_code,
      returnee_name,
      returnee_phone,
      returnee_citizen_id_number,
      remark,
      status = 'INSPECTED',
      skus = [],
    } = req.body

    if (!loan_form_code || !returnee_name || !returnee_phone) {
      return res.status(400).json({
        message: 'loan_form_code, returnee_name and returnee_phone are required',
      })
    }

    const loan = (
      queryCollection('loan_forms', {
        'code:eq': loan_form_code,
      }) as any[]
    )[0]
    if (!loan) {
      return res.status(404).json({ message: 'Loan form not found for provided loan_form_code' })
    }

    if (loan.status !== 'BORROWING') {
      return res.status(400).json({ message: 'Only BORROWING loan forms can create return form' })
    }

    const db = getDb()
    const createdBy = Number(req.body.created_by ?? getRequesterEmployeeId(req) ?? 0)
    const code = nextCode('return_forms', 'code', 'RF')
    const inferredRole = String(loan.borrower_role ?? 'EXTERNAL')
    const inferredMethod = String(loan.method ?? 'BORROW')

    const created = db
      .get('return_forms')
      .insert({
        code,
        loan_form_code,
        returnee_name,
        returnee_phone,
        returnee_citizen_id_number: returnee_citizen_id_number ?? null,
        remark: remark ?? null,
        returnee_role: inferredRole,
        method: inferredMethod,
        created_by: createdBy || null,
        status,
        is_active: true,
        created_at: nowISO(),
        updated_at: null,
      })
      .write()

    const incomingSkus = Array.isArray(skus) ? skus.map(String) : []
    if (incomingSkus.length > 0) {
      createReturnItemsFromSkus(code, incomingSkus, createdBy || null)
    } else {
      const loanItems = queryCollection('loan_form_items', {
        'loan_form_code:eq': loan_form_code,
      }) as any[]
      createReturnItemsFromSkus(
        code,
        loanItems.map((item) => String(item.sku)),
        createdBy || null
      )
    }

    return res.status(201).json(buildReturnDetail(created))
  })

  app.patch('/api/return-forms/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('return_forms').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Return form not found' })
    }

    const { id: _id, code, created_at, ...updateData } = req.body
    const updated = db
      .get('return_forms')
      .find({ id })
      .assign({
        ...updateData,
        updated_at: nowISO(),
      })
      .write()

    return res.status(200).json(buildReturnDetail(updated))
  })

  app.delete('/api/return-forms/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('return_forms').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Return form not found' })
    }

    if (req.query.permanantly && JSON.parse(String(req.query.permanantly))) {
      db.get('return_forms').remove({ id }).write()
      db.get('return_form_items').remove({ return_form_code: existing.code }).write()
    } else {
      db.get('return_forms').find({ id }).assign({ is_active: false, updated_at: nowISO() }).write()
    }

    return res.status(200).json({ message: 'Return form deleted successfully' })
  })

  app.post('/api/return-forms/:id/items', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('return_forms').find({ id }).value()

    if (!existing) {
      return res.status(404).json({ message: 'Return form not found' })
    }

    const skus = Array.isArray(req.body.skus) ? req.body.skus.map(String) : []
    if (!skus.length) {
      return res.status(400).json({ message: 'skus is required and must be a non-empty array' })
    }

    createReturnItemsFromSkus(existing.code, skus, getRequesterEmployeeId(req))
    const fresh = db.get('return_forms').find({ id }).value()

    return res.status(200).json(buildReturnDetail(fresh))
  })

  app.patch('/api/return-form-items/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('return_form_items').find({ id }).value()

    if (!existing) {
      return res.status(404).json({ message: 'Return form item not found' })
    }

    const { id: _id, created_at, return_form_code, ...updateData } = req.body
    const updated = db
      .get('return_form_items')
      .find({ id })
      .assign({ ...updateData, updated_at: nowISO() })
      .write()

    return res.status(200).json(updated)
  })

  app.delete('/api/return-form-items/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('return_form_items').find({ id }).value()

    if (!existing) {
      return res.status(404).json({ message: 'Return form item not found' })
    }

    db.get('return_form_items').remove({ id }).write()
    return res.status(200).json({ message: 'Return form item deleted successfully' })
  })

  app.post('/api/return-forms/:id/inspect', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('return_forms').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Return form not found' })
    }

    const changedAt = nowISO()
    const updates = Array.isArray(req.body.items) ? req.body.items : []
    for (const row of updates) {
      const sku = String(row?.sku ?? '').trim()
      if (!sku) continue
      db.get('return_form_items')
        .find({ return_form_code: existing.code, sku })
        .assign({
          condition_on_return: row.condition_on_return ?? 'GOOD',
          updated_at: changedAt,
        })
        .write()
    }

    const updated = db.get('return_forms').find({ id }).assign({ status: 'INSPECTED', updated_at: changedAt }).write()
    return res.status(200).json(buildReturnDetail(updated))
  })

  app.post('/api/return-forms/:id/complete', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('return_forms').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Return form not found' })
    }

    const returnItems = queryCollection('return_form_items', {
      'return_form_code:eq': existing.code,
    }) as any[]

    if (!returnItems.length) {
      return res.status(400).json({ message: 'Return form has no items to complete' })
    }

    const changedAt = nowISO()

    for (const item of returnItems) {
      const conditionId = toConditionId(item.condition_on_return)
      const newStatus: InventoryStatus = conditionId === 1 ? 'AVAILABLE' : 'MAINTENANCE'

      db.get('inventory')
        .find({ sku: item.sku })
        .assign({
          status: newStatus,
          inventory_condition_id: conditionId,
          updated_at: changedAt,
        })
        .write()

      db.get('loan_form_items')
        .find({ loan_form_code: existing.loan_form_code, sku: item.sku })
        .assign({ is_returned: true, updated_at: changedAt })
        .write()
    }

    const updatedReturn = db
      .get('return_forms')
      .find({ id })
      .assign({ status: 'RETURNED', updated_at: changedAt })
      .write()

    const loan = (
      queryCollection('loan_forms', {
        'code:eq': existing.loan_form_code,
      }) as any[]
    )[0]

    if (loan) {
      const loanItems = queryCollection('loan_form_items', {
        'loan_form_code:eq': loan.code,
      }) as any[]
      const isAllReturned = loanItems.every((item) => Boolean(item.is_returned))
      if (isAllReturned) {
        db.get('loan_forms').find({ id: loan.id }).assign({ status: 'RETURNED', updated_at: changedAt }).write()
      }
    }

    return res.status(200).json(buildReturnDetail(updatedReturn))
  })
}
