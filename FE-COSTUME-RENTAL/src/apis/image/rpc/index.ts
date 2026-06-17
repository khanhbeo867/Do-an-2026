import { requestMiddleware } from '@/middlewares/request.middleware'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { updateImageSchema } from '../schemas/update-image.schema'

export const getImagesRpc = createServerFn({ method: 'GET' })
  .middleware([requestMiddleware])
  .handler(async ({ context }) => {
    return await context.request({ url: '/images-gallery', params: { _expand: 'category' } })
  })

export const uploadImagesRpc = createServerFn({ method: 'POST' })
  .middleware([requestMiddleware])
  .inputValidator(z.instanceof(FormData))
  .handler(async ({ context, data }) => {
    return await context
      .request({
        url: '/images-gallery/upload',
        method: 'POST',
        data,
      })
      .catch((error) => console.error(error))
  })

export const updateImageRpc = createServerFn({ method: 'POST' })
  .middleware([requestMiddleware])
  .inputValidator(updateImageSchema)
  .handler(async ({ context, data: { id, ...update } }) => {
    return await context.request({
      url: `/images-gallery/${id}`,
      method: 'PATCH',
      data: { ...update, ...(update.category && { category_id: update.category.value }) },
    })
  })

export const deleteImageRpc = createServerFn({ method: 'POST' })
  .middleware([requestMiddleware])
  .inputValidator(z.number())
  .handler(async ({ context, data }) => {
    return await context.request({ url: `/images-gallery/${data}`, method: 'DELETE', params: { permanantly: true } })
  })
