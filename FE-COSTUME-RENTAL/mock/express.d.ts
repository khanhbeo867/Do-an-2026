import type { IUser } from '@/apis/user/types'
import type { FileArray } from 'express-fileupload'

module 'express' {
  interface Request {
    user?: Pick<IUser, 'id' | 'username' | 'role'> // Adjust the type as needed
    token?: string
    // files?: FileArray
    'files[]'?: FileArray // For multiple file uploads
  }
}
