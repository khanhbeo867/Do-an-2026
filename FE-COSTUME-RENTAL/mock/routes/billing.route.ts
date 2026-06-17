import type { Application, Request, Response } from 'express'
import { getDb, queryCollection, queryRecord } from '../lib'
import { jwtMiddleware } from '../middleware'
import { getRequesterEmployeeId, nextCode, nowISO } from './workflow.helpers'

function buildPenaltyDetail(record: any) {
  const employee = queryRecord('employees', Number(record.created_by), {})
  const loan = record.loan_form_code
    ? (
        queryCollection('loan_forms', {
          'code:eq': record.loan_form_code,
        }) as any[]
      )[0]
    : null
  const returnForm = record.return_form_code
    ? (
        queryCollection('return_forms', {
          'code:eq': record.return_form_code,
        }) as any[]
      )[0]
    : null
  const invoices = record.code
    ? (queryCollection('invoices', {
        'penalty_form_code:eq': record.code,
      }) as any[])
    : []

  return {
    ...record,
    created_by_employee: employee,
    loan_form: loan,
    return_form: returnForm,
    invoices,
  }
}

function resolveRentalAmount(loanFormCode?: string, rentalDays?: number) {
  if (!loanFormCode) return 0
  const days = Math.max(1, Number(rentalDays ?? 1))
  const items = queryCollection('loan_form_items', {
    'loan_form_code:eq': loanFormCode,
  }) as any[]

  return items.reduce((sum, item) => sum + Number(item.rental_price_per_day ?? 0) * days, 0)
}

function resolvePenaltyAmount(penaltyFormCode?: string) {
  if (!penaltyFormCode) return 0
  const penalty = (
    queryCollection('penalty_forms', {
      'code:eq': penaltyFormCode,
    }) as any[]
  )[0]
  return Number(penalty?.amount ?? 0)
}

function buildInvoiceDetail(record: any) {
  const employee = queryRecord('employees', Number(record.created_by), {})
  const loan = record.loan_form_code
    ? (
        queryCollection('loan_forms', {
          'code:eq': record.loan_form_code,
        }) as any[]
      )[0]
    : null
  const returnForm = record.return_form_code
    ? (
        queryCollection('return_forms', {
          'code:eq': record.return_form_code,
        }) as any[]
      )[0]
    : null
  const penalty = record.penalty_form_code
    ? (
        queryCollection('penalty_forms', {
          'code:eq': record.penalty_form_code,
        }) as any[]
      )[0]
    : null

  return {
    ...record,
    created_by_employee: employee,
    loan_form: loan,
    return_form: returnForm,
    penalty_form: penalty,
  }
}

export function registerBillingRoutes(app: Application) {
  app.get('/api/penalty-forms', jwtMiddleware, (req: Request, res: Response) => {
    const results = queryCollection('penalty_forms', req.query, {
      transform: (record) => buildPenaltyDetail(record),
    })
    return res.status(200).json(results)
  })

  app.get('/api/penalty-forms/:id', jwtMiddleware, (req: Request, res: Response) => {
    const record = queryRecord('penalty_forms', Number(req.params.id), req.query)
    if (!record) {
      return res.status(404).json({ message: 'Penalty form not found' })
    }
    return res.status(200).json(buildPenaltyDetail(record))
  })

  app.post('/api/penalty-forms', jwtMiddleware, (req: Request, res: Response) => {
    const { loan_form_code, return_form_code, reason, amount = 0, status = 'ISSUED' } = req.body
    if (!reason) {
      return res.status(400).json({ message: 'reason is required' })
    }

    const db = getDb()
    const code = nextCode('penalty_forms', 'code', 'PF')
    const createdBy = Number(req.body.created_by ?? getRequesterEmployeeId(req) ?? 0)

    const created = db
      .get('penalty_forms')
      .insert({
        code,
        loan_form_code: loan_form_code ?? null,
        return_form_code: return_form_code ?? null,
        reason,
        amount: Number(amount ?? 0),
        created_by: createdBy || null,
        status,
        is_active: true,
        created_at: nowISO(),
        updated_at: null,
      })
      .write()

    return res.status(201).json(buildPenaltyDetail(created))
  })

  app.patch('/api/penalty-forms/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('penalty_forms').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Penalty form not found' })
    }

    const { id: _id, code, created_at, ...updateData } = req.body
    const updated = db
      .get('penalty_forms')
      .find({ id })
      .assign({ ...updateData, updated_at: nowISO() })
      .write()

    return res.status(200).json(buildPenaltyDetail(updated))
  })

  app.delete('/api/penalty-forms/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('penalty_forms').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Penalty form not found' })
    }

    if (req.query.permanantly && JSON.parse(String(req.query.permanantly))) {
      db.get('penalty_forms').remove({ id }).write()
    } else {
      db.get('penalty_forms').find({ id }).assign({ is_active: false, updated_at: nowISO() }).write()
    }

    return res.status(200).json({ message: 'Penalty form deleted successfully' })
  })

  app.post('/api/penalty-forms/:id/issue', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('penalty_forms').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Penalty form not found' })
    }

    const updated = db.get('penalty_forms').find({ id }).assign({ status: 'ISSUED', updated_at: nowISO() }).write()
    return res.status(200).json(buildPenaltyDetail(updated))
  })

  app.post('/api/penalty-forms/:id/pay', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('penalty_forms').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Penalty form not found' })
    }

    const updated = db.get('penalty_forms').find({ id }).assign({ status: 'PAID', updated_at: nowISO() }).write()
    return res.status(200).json(buildPenaltyDetail(updated))
  })

  app.get('/api/invoices', jwtMiddleware, (req: Request, res: Response) => {
    const results = queryCollection('invoices', req.query, {
      transform: (record) => buildInvoiceDetail(record),
    })
    return res.status(200).json(results)
  })

  app.get('/api/invoices/:id', jwtMiddleware, (req: Request, res: Response) => {
    const record = queryRecord('invoices', Number(req.params.id), req.query)
    if (!record) {
      return res.status(404).json({ message: 'Invoice not found' })
    }
    return res.status(200).json(buildInvoiceDetail(record))
  })

  app.post('/api/invoices', jwtMiddleware, (req: Request, res: Response) => {
    const {
      loan_form_code,
      return_form_code,
      penalty_form_code,
      total_amount,
      payment_amount,
      rental_amount,
      penalty_amount,
      refund_amount,
      payment_method,
      payer_name,
      payer_phone,
      payer_citizen_id_number,
      paid_at,
      note,
      rental_days = 1,
      extra_amount = 0,
      status = 'ISSUED',
    } = req.body

    const db = getDb()
    const code = nextCode('invoices', 'code', 'INV')
    const createdBy = Number(req.body.created_by ?? getRequesterEmployeeId(req) ?? 0)

    const resolvedTotal =
      Number(total_amount ?? 0) > 0
        ? Number(total_amount)
        : resolveRentalAmount(loan_form_code, rental_days) +
          resolvePenaltyAmount(penalty_form_code) +
          Number(extra_amount ?? 0)

    const created = db
      .get('invoices')
      .insert({
        code,
        loan_form_code: loan_form_code ?? null,
        return_form_code: return_form_code ?? null,
        penalty_form_code: penalty_form_code ?? null,
        total_amount: resolvedTotal,
        payment_amount: Number(payment_amount ?? resolvedTotal),
        rental_amount: Number(rental_amount ?? 0),
        penalty_amount: Number(penalty_amount ?? 0),
        refund_amount: Number(refund_amount ?? 0),
        payment_method: payment_method ?? null,
        payer_name: payer_name ?? null,
        payer_phone: payer_phone ?? null,
        payer_citizen_id_number: payer_citizen_id_number ?? null,
        paid_at: paid_at ?? null,
        note: note ?? null,
        created_by: createdBy || null,
        status,
        is_active: true,
        created_at: nowISO(),
        updated_at: null,
      })
      .write()

    return res.status(201).json(buildInvoiceDetail(created))
  })

  app.patch('/api/invoices/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('invoices').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    const { id: _id, code, created_at, ...updateData } = req.body
    const updated = db
      .get('invoices')
      .find({ id })
      .assign({ ...updateData, updated_at: nowISO() })
      .write()

    return res.status(200).json(buildInvoiceDetail(updated))
  })

  app.delete('/api/invoices/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('invoices').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    if (req.query.permanantly && JSON.parse(String(req.query.permanantly))) {
      db.get('invoices').remove({ id }).write()
    } else {
      db.get('invoices').find({ id }).assign({ is_active: false, updated_at: nowISO() }).write()
    }

    return res.status(200).json({ message: 'Invoice deleted successfully' })
  })

  app.post('/api/invoices/:id/issue', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('invoices').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    const updated = db.get('invoices').find({ id }).assign({ status: 'ISSUED', updated_at: nowISO() }).write()
    return res.status(200).json(buildInvoiceDetail(updated))
  })

  app.post('/api/invoices/:id/pay', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('invoices').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    const updated = db.get('invoices').find({ id }).assign({ status: 'PAID', updated_at: nowISO() }).write()

    if (updated.penalty_form_code) {
      const penalty = (
        queryCollection('penalty_forms', {
          'code:eq': updated.penalty_form_code,
        }) as any[]
      )[0]

      if (penalty) {
        db.get('penalty_forms').find({ id: penalty.id }).assign({ status: 'PAID', updated_at: nowISO() }).write()
      }
    }

    return res.status(200).json(buildInvoiceDetail(updated))
  })
}
