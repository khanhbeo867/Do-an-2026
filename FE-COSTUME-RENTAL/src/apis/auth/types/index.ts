import type { IUser } from '@/apis/user/types'

export type TLoginResponse = {
  access_token: string
  user: IUser
  token_type: 'bearer'
  expires_in: number
}
