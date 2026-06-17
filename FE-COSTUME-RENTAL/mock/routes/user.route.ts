import generateAvatar from '@/lib/generate-avatar'
import type { Application, Request, Response } from 'express'
import { router } from '..'
import { getDb, queryCollection, queryRecord } from '../lib'
import { jwtMiddleware } from '../middleware'

const addAvatar = (r: any) => ({
  ...r,
  avatar: generateAvatar({ name: r.employee?.full_name }),
})
const userOpts = { omit: ['password'], transform: addAvatar }

export function registerUserRoutes(app: Application) {
  // * GET /users
  app.get('/api/users', jwtMiddleware, (req: Request, res: Response) => {
    const result = queryCollection('users', req.query, userOpts)
    return res.status(200).json(result)
  })

  // * GET /users/:id
  app.get('/api/users/:id', jwtMiddleware, (req: Request, res: Response) => {
    const result = queryRecord('users', Number(req.params.id), req.query, userOpts)
    if (!result) return res.status(404).json({ message: 'User not found' })
    return res.status(200).json(result)
  })

  // * POST /users
  app.post('/api/users', jwtMiddleware, (req: Request, res: Response) => {
    const { username, password, employee_id, role = 'USER' } = req.body

    if (!username) {
      return res.status(400).json({
        message: 'username, email, password and display_name are required',
      })
    }

    const db = router.db as any
    const existingUser = db
      .get('users')
      .find((u: any) => u.username === username)
      .value()

    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' })
    }

    const bcrypt = require('bcryptjs')
    const hashedPassword = bcrypt.hashSync(password, 10)
    const newUser = {
      username,
      password: hashedPassword,
      role,
      employee_id,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: null,
    }

    const created = db.get('users').insert(newUser).write()
    const { password: _, ...userWithoutPassword } = created

    const employee = db.get('employees').find({ id: created.employee_id }).value()

    return res.status(201).json({
      ...userWithoutPassword,
      avatar: generateAvatar({ name: employee?.full_name }),
    })
  })

  // * PATCH /users/:id
  app.patch('/api/users/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)

    const existing = db.get('users').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Prevent updating sensitive/immutable fields
    const { password, id: _id, created_at, ...updateData } = req.body

    // Check duplicate username/email if being changed
    if (updateData.username || updateData.email) {
      const duplicate = db
        .get('users')
        .find((u: any) => {
          if (u.id === id) return false
          return updateData.username && u.username === updateData.username
        })
        .value()

      if (duplicate) {
        return res.status(409).json({ message: 'Username or email already exists' })
      }
    }

    console.log('updateData', updateData)

    const updated = db
      .get('users')
      .find({ id })
      .assign({ ...updateData, updated_at: new Date().toISOString() })
      .write()

    const { password: _, ...userWithoutPassword } = updated

    return res.status(200).json({
      ...userWithoutPassword,
      avatar: generateAvatar({ name: userWithoutPassword.display_name }),
    })
  })

  // * DELETE /users/:id
  app.delete('/api/users/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)
    const existing = db.get('users').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'User not found' })
    }

    db.get('users').remove({ id }).write()

    return res.status(200).json({
      message: 'User deleted successfully',
      user: db.get('users').find({ id }),
    })
  })
}
