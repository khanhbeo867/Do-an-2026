import { z } from 'zod'

export const updateImageSchema = z
  .object({
    id: z.number(),
    file_name: z.string({ message: 'Vui lòng nhập tên file mới' }).nullish(),
    category: z
      .object(
        {
          value: z.number(),
          label: z.string(),
        },
        { message: 'Vui lòng chọn danh mục' }
      )
      .nullish(),
  })
  .default({ id: 0, file_name: '', category: { value: 0, label: '' } })

export type TUpdateImageValues = z.infer<typeof updateImageSchema>
