import generateAvatar from '@/lib/generate-avatar'
import bcrypt from 'bcryptjs'
import type { Application, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { router } from '..'
import { jwtMiddleware } from '../middleware'

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET!
const JWT_EXPIRES_IN: jwt.SignOptions['expiresIn'] = '1d'

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
}

export function registerAuthRoutes(app: Application) {
  // * POST /login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: 'Username/email and password are required' })
    }

    const db = router.db as any
    const user = db
      .get('users')
      .find((u: any) => u.username === username)
      .value()

    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' })
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid username or password' })
    }

    if (!user.is_active)
      return res.status(403).json({
        message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
      })

    const accessToken = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET!, {
      expiresIn: JWT_EXPIRES_IN,
    })

    res.cookie('accessToken', accessToken, cookieOptions)

    const { password: _, ...userWithoutPassword } = user

    return res.status(200).json({
      access_token: accessToken,
      user: {
        ...userWithoutPassword,
        avatar: generateAvatar({ name: userWithoutPassword.display_name }),
      },
    })
  })

  // * POST /register
  app.post('/api/register', (req: Request, res: Response) => {
    const { username, email, password, display_name, role = 'USER' } = req.body

    if (!username || !email || !password || !display_name) {
      return res.status(400).json({
        message: 'username, email, password and display_name are required',
      })
    }

    const db = router.db as any
    const existingUser = db
      .get('users')
      .find((u: any) => u.username === username || u.email === email)
      .value()

    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' })
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    const newUser = {
      username,
      email,
      password: hashedPassword,
      display_name,
      role,
      employee_id: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: null,
    }

    const created = db.get('users').insert(newUser).write()
    const { password: _, ...userWithoutPassword } = created

    return res.status(201).json({
      ...userWithoutPassword,
      avatar: generateAvatar({ name: userWithoutPassword.display_name }),
    })
  })

  // * POST /logout
  app.post('/api/auth/logout', jwtMiddleware, (req: Request, res: Response) => {
    const token = (req as any).token
    const db = router.db as any

    db.get('revoke_tokens').push({ access_token: token }).write()
    res.clearCookie('accessToken', { path: '/' })

    return res.status(200).json({ message: 'Logged out successfully' })
  })

  // * GET /refresh
  app.get('/api/auth/refresh', (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader) return res.status(403).json({ message: 'Invalid access token' })

      const expiredAccessToken = authHeader.replace('Bearer', '').trim()

      if (!expiredAccessToken) return res.status(403).json({ message: 'Invalid access token' })

      const tokenPart = expiredAccessToken.split('.').at(1)
      if (!tokenPart) return res.status(403).json({ message: 'Invalid access token format' })

      const payload = JSON.parse(atob(tokenPart))

      const db = router.db as any
      const user = db.get('users').find({ id: payload?.id }).value()

      if (!user) {
        return res.status(403).json({ message: 'User not found' })
      }

      // Revoke old token
      db.get('revoke_tokens').push({ access_token: expiredAccessToken }).write()

      // Issue new token
      const accessToken = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET!, {
        expiresIn: JWT_EXPIRES_IN,
      })

      res.cookie('access_token', accessToken, cookieOptions)

      return res.status(200).json({ access_token: accessToken })
    } catch (error) {
      return res.status(403).json(error)
    }
  })

  // * GET /auth/me
  app.get('/api/auth/me', jwtMiddleware, (req: Request, res: Response) => {
    const payload = req.user!

    const user = (router.db as any).get('users').find({ id: payload.id }).value()

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const employee = router.db.get('employees').find({ id: user.employee_id }).value()

    const { password, ...userWithoutPassword } = user
    return res.status(200).json({
      ...userWithoutPassword,
      employee,
      avatar: generateAvatar({ name: employee?.full_name }),
    })
  })
}
