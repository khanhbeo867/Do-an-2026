import z from 'zod'

export const deleteCategorySchema = z.object({ id: z.number(), permanantly: z.boolean() })

export type TDeleteCategoryReqValues = z.infer<typeof deleteCategorySchema>
