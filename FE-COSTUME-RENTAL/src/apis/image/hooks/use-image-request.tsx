import { createFormData } from '@/common/helpers/form-data'
import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { deleteImageRpc, getImagesRpc, updateImageRpc, uploadImagesRpc } from '../rpc'
import type { TUpdateImageValues } from '../schemas/update-image.schema'
import type { TUploadImagesValues } from '../schemas/upload-images.schema'

export const GET_IMAGES_QUERY_KEY = 'images' as const

export const getImagesQueryOptions = () => {
  return queryOptions({
    queryKey: [GET_IMAGES_QUERY_KEY],
    queryFn: () => getImagesRpc(),
  })
}

export const useGetImagesQuery = () => {
  return useQuery(getImagesQueryOptions())
}

export const useUploadImagesMutation = () => {
  const uploadImageFn = useServerFn(uploadImagesRpc)

  return useMutation({
    meta: { invalidates: [[GET_IMAGES_QUERY_KEY]] },
    mutationFn: (data: TUploadImagesValues) =>
      uploadImageFn({
        data: createFormData({
          category_id: data.category.value,
          'files[]': data.files,
        }),
      }),
  })
}

export const useUpdateImageMutation = () => {
  const updateImageFn = useServerFn(updateImageRpc)

  return useMutation({
    meta: { invalidates: [[GET_IMAGES_QUERY_KEY]] },
    mutationFn: async (data: TUpdateImageValues) => updateImageFn({ data }),
  })
}

export const useDeleteImageMutation = () => {
  const deleteImageFn = useServerFn(deleteImageRpc)

  return useMutation({
    meta: { invalidates: [[GET_IMAGES_QUERY_KEY]] },
    mutationFn: async (id: number) => deleteImageFn({ data: id }),
  })
}
