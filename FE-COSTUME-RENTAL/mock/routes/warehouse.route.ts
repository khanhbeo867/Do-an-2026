import type { Application, Request, Response } from 'express'
import { getDb, queryCollection, queryRecord } from '../lib'
import { jwtMiddleware } from '../middleware'

export function registerWarehouseRoutes(app: Application) {
  // * GET /warehouses
  app.get('/api/warehouses', jwtMiddleware, (req: Request, res: Response) => {
    const result = queryCollection('warehouses', req.query, {
      transform: (record) => {
        const employee = queryRecord('employees', record.managed_by)
        return {
          ...record,
          manager: employee,
        }
      },
    })
    return res.status(200).json(result)
  })

  // * GET /warehouses/:id
  app.get('/api/warehouses/:id', jwtMiddleware, (req: Request, res: Response) => {
    const result = queryRecord('warehouses', Number(req.params.id), req.query)
    if (!result) return res.status(404).json({ message: 'Warehouse not found' })
    return res.status(200).json(result)
  })

  // * POST /warehouses
  app.post('/api/warehouses', jwtMiddleware, (req: Request, res: Response) => {
    const { name, type, managed_by } = req.body

    if (!name || !type) {
      return res.status(400).json({
        message: 'name, warehouse_code and type are required',
      })
    }

    const db = getDb()
    const newWarehouse = {
      name,
      type,
      managed_by: managed_by ?? null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: null,
    }

    const created = db.get('warehouses').insert(newWarehouse).write()
    return res.status(201).json(created)
  })

  // * PATCH /warehouses/:id
  app.patch('/api/warehouses/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)

    const existing = db.get('warehouses').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Warehouse not found' })
    }

    const { id: _id, created_at, ...updateData } = req.body

    const updated = db
      .get('warehouses')
      .find({ id })
      .assign({ ...updateData, updated_at: new Date().toISOString() })
      .write()

    return res.status(200).json(updated)
  })

  // * DELETE /warehouses/:id
  app.delete('/api/warehouses/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)

    const existing = db.get('warehouses').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Warehouse not found' })
    }

    if (req.query.permanantly && JSON.parse(req.query.permanantly as string)) {
      db.get('warehouses').remove({ id }).write()
    } else {
      db.get('warehouses').find({ id }).assign({ is_active: false, updated_at: new Date().toISOString() }).write()
    }

    return res.status(200).json({
      message: 'Warehouse deleted successfully',
    })
  })
}
