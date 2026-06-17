import { WorkStatus } from '@/apis/employee/constants'
import type { Application, Request, Response } from 'express'
import { generateEmployeeCode } from '../helpers'
import { getDb, queryCollection, queryRecord } from '../lib'
import { jwtMiddleware } from '../middleware'

export function registerEmployeeRoutes(app: Application) {
  // * GET /employees
  app.get('/api/employees', jwtMiddleware, (req: Request, res: Response) => {
    const result = queryCollection('employees', req.query)
    return res.status(200).json(result)
  })

  // * GET /employees/:id
  app.get('/api/employees/:id', jwtMiddleware, (req: Request, res: Response) => {
    const result = queryRecord('employees', Number(req.params.id), req.query)
    if (!result) return res.status(404).json({ message: 'Employee not found' })
    return res.status(200).json(result)
  })

  // * POST /employees
  app.post('/api/employees', jwtMiddleware, (req: Request, res: Response) => {
    const { full_name, phone, email, address, citizen_id_number, position, work_status = WorkStatus.ACTIVE } = req.body

    const db = getDb()
    const newEmployee = {
      employee_code: '',
      full_name,
      phone: phone ?? null,
      email,
      address: address ?? null,
      work_status,
      citizen_id_number,
      user_id: null,
      is_active: true,
      position,
      created_at: new Date().toISOString(),
      updated_at: null,
    }

    const created = db.get('employees').insert(newEmployee).write()
    db.get('employees')
      .find({ id: created.id })
      .assign({ employee_code: generateEmployeeCode(created.id) })
      .write()
    return res.status(201).json(db.get('employees').find({ id: created.id }).value())
  })

  // * PATCH /employees/:id
  app.patch('/api/employees/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)

    const existing = db.get('employees').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Employee not found' })
    }

    // Prevent updating immutable fields
    const { id: _id, employee_code, created_at, ...updateData } = req.body

    const updated = db
      .get('employees')
      .find({ id })
      .assign({
        ...updateData,
        updated_at: new Date().toISOString(),
        is_active: updateData.work_status !== WorkStatus.EXITED,
      })
      .write()

    return res.status(200).json(updated)
  })

  // * DELETE /employees/:id
  app.delete('/api/employees/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)

    const existing = db.get('employees').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Employee not found' })
    }

    if (req.query.permanantly && JSON.parse(req.query.permanantly as string)) {
      db.get('employees').remove({ id }).write()
      // Unlink user if linked
      db.get('users').find({ employee_id: id }).assign({ employee_id: null }).write()
    } else {
      db.get('employees').find({ id }).assign({ is_active: false, updated_at: new Date().toISOString() }).write()
    }

    return res.status(200).json({
      message: 'Employee deleted successfully',
      employee: db.get('employees').find({ id }),
    })
  })
}
