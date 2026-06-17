import { useWorkerFn } from '@/hooks/use-worker-fn'
import compressBase64 from '@/lib/compress-base64'
import convertBase64 from '@/lib/convert-base64'
import { useCallback, useEffect, useRef, useState } from 'react'

type UseImageUploadOptions = {
  onUpload?: (url: string) => void
}

export function useImageUpload({ onUpload }: UseImageUploadOptions = {}) {
  const previewRef = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { execute: compress, isPending } = useWorkerFn(compressBase64)

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        setFileName(file.name)
        const localUrl = URL.createObjectURL(file)
        setPreviewUrl(localUrl)
        previewRef.current = localUrl
        try {
          const base64Url = await convertBase64(file)
          const compressedBase64 = await compress(base64Url!.toString(), { quality: 1 })
          if (typeof onUpload === 'function') onUpload(compressedBase64)
        } catch (err) {
          URL.revokeObjectURL(localUrl)
          setPreviewUrl(null)
          setFileName(null)
          return console.error(err)
        }
      }
    },
    [onUpload]
  )

  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setFileName(null)
    previewRef.current = null
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setError(null)
  }, [previewUrl])

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
      }
    }
  }, [])

  return {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    isPending,
    error,
  }
}
