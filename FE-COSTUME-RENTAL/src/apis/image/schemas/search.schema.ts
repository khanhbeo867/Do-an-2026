import z from 'zod'

export const searchImagesSchema = z.object({
  category: z.string().nullish(),
  mime_type: z.string().nullish(),
  from: z.string().nullish(),
  to: z.string().nullish(),
})

export type TSearchImagesValues = z.infer<typeof searchImagesSchema>
