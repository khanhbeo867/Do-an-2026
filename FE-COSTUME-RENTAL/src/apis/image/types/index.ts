import type { ICategory } from '@/apis/category/types'
import type { IUser } from '@/apis/user/types'

export type TMimeType = `image/${'jpeg' | 'jpg' | 'png' | 'webp' | 'avif'}`

export type TImageMetadata = {
  file_name: string
  size: number
  dest: string
  url: string
  mime_type: TMimeType
}

export interface IImage extends IBaseEntity, TImageMetadata {
  category_id: number
  category: ICategory
  created_by: IUser
}
