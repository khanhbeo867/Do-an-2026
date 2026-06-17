import { path } from '@/lib/polyfill'
import env from '@/lib/utils'

export const getImageUrl = (url: string) => {
  url = path.join('/storage/images-gallery', url) // Ensure the path starts with a slash and is correctly joined
  return new URL(url, env('VITE_EXTERNAL_API_URL')).toString()
}

export const rewriteImageUrl = (url: string | undefined) => {
  if (!url) return ''

  const rewritedURL = path.join('/storage/images-gallery', url)

  return rewritedURL
}
