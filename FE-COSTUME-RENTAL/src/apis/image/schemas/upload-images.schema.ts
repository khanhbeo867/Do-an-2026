import { z } from 'zod'

export const uploadImagesSchema = z.object({
  category: z.object({ label: z.string().nonempty(), value: z.number() }, { message: 'Chọn 1 danh mục' }),
  files: z.any().refine((list) => list.length > 0, 'Chưa có ảnh nào được chọn'),
})

export type TUploadImagesValues = z.infer<typeof uploadImagesSchema>
