type CompressBase64Options = {
  type?: string
  width?: number
  height?: number
  min?: number // KB
  max?: number // KB
  quality?: number // Preferred initial quality
  debug?: boolean
  // Can be extended with more options if needed
}

/**
 * @author quanghiep03198
 * @createdDate 2025-08-19
 * @lastModified 2026-01-19
 * @description Compress and resize a base64 image string with specified constraints.
 * @example
 * ```ts
 * // Basic example, use webp format and run in web worker is recommended
 * const compressedBase64 = await compressBase64(originalBase64, {
 * 	type: 'image/webp',
 * 	width: 300,
 * 	height: 200,
 * 	max: 50, // Max 50KB
 * 	quality: 0.8,
 * 	debug: true
 * })
 * ```
 */
export default async function compressBase64(base64: string, options?: CompressBase64Options) {
  // Optimization: Use WebP by default (20-40% smaller than PNG)
  const { type = 'image/webp', width, height, min = 0, max = 200, quality = 0.85, debug = true } = options ?? {}

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  }

  try {
    const srcBlob = await fetch(base64).then((res) => res.blob())
    const imgBitmap = await createImageBitmap(srcBlob)

    const originalWidth = imgBitmap.width
    const originalHeight = imgBitmap.height
    let targetWidth = originalWidth
    let targetHeight = originalHeight

    // Calculate target dimensions proportionally (no distortion)
    if (width && height) {
      const widthRatio = width / originalWidth
      const heightRatio = height / originalHeight
      const ratio = Math.min(widthRatio, heightRatio)
      targetWidth = Math.max(1, Math.round(originalWidth * ratio))
      targetHeight = Math.max(1, Math.round(originalHeight * ratio))
    } else if (width) {
      targetWidth = Math.max(1, width)
      targetHeight = Math.max(1, Math.round((width / originalWidth) * originalHeight))
    } else if (height) {
      targetHeight = Math.max(1, height)
      targetWidth = Math.max(1, Math.round((height / originalHeight) * originalWidth))
    }

    // Helper: render to blob with high smoothing quality
    async function renderToBlob(w: number, h: number, q: number): Promise<Blob> {
      const canvas = new OffscreenCanvas(w, h)
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('2D context is not available')
      ;(ctx as any).imageSmoothingEnabled = true
      ;(ctx as any).imageSmoothingQuality = 'high'

      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(imgBitmap, 0, 0, w, h)

      const qSafe = Math.max(0, Math.min(1, q))
      return await canvas.convertToBlob({ type, quality: qSafe })
    }

    // Binary search for the highest quality while staying <= max (KB)
    async function fitUnderMax(w: number, h: number) {
      if (max <= 0) {
        // No max limit -> render with preferred quality
        const b = await renderToBlob(w, h, quality)
        return { q: quality, blob: b }
      }

      // Optimization: Lower quality threshold for more aggressive compression
      let low = 0.2 // Reduced from 0.3 to 0.2 (deeper compression ~15-20%)
      let high = 1
      let best: { q: number; blob: Blob } | null = null

      // Try with preferred quality first
      const firstBlob = await renderToBlob(w, h, quality)
      if (firstBlob.size / 1024 <= max) {
        best = { q: quality, blob: firstBlob }
        low = Math.max(low, quality)
      } else {
        high = Math.min(high, quality)
      }

      // Optimization: Increase binary search iterations for better precision
      for (let i = 0; i < 12; i++) {
        const mid = (low + high) / 2
        const b = await renderToBlob(w, h, mid)
        const kb = b.size / 1024
        if (kb <= max) {
          best = { q: mid, blob: b }
          low = mid // Try to increase quality further
        } else {
          high = mid // Reduce quality
        }
      }

      // If still not achieved, try at low (lower bound)
      if (!best) {
        const b = await renderToBlob(w, h, low)
        if (b.size / 1024 <= max) best = { q: low, blob: b }
      }

      return best
    }

    // Strategy: prioritize maintaining dimensions (per selected width/height) and optimize quality.
    // If still exceeds max, reduce dimensions proportionally and try again.
    let w = targetWidth
    let h = targetHeight

    let fitted = await fitUnderMax(w, h)

    // Optimization: More aggressive downscaling (0.8x instead of 0.85x per iteration)
    // If can't fit within max, downscale gradually and retry
    if (!fitted && max > 0) {
      for (let i = 0; i < 10; i++) {
        // Reduce dimensions by 20% each iteration (more aggressive than the old 15%)
        w = Math.max(1, Math.round(w * 0.8))
        h = Math.max(1, Math.round(h * 0.8))
        fitted = await fitUnderMax(w, h)
        if (fitted) break
      }
    }

    let finalBlob: Blob
    let finalQ = quality

    if (fitted) {
      finalBlob = fitted.blob
      finalQ = fitted.q

      // If min (KB) is specified, try to maximize quality without exceeding max
      if (min > 0) {
        const kb = finalBlob.size / 1024
        if (kb < min) {
          let low = finalQ
          let high = 1
          let best = { q: finalQ, blob: finalBlob }
          for (let i = 0; i < 8; i++) {
            const mid = (low + high) / 2
            const b = await renderToBlob(w, h, mid)
            const sizeKB = b.size / 1024
            if (sizeKB <= max && sizeKB >= min) {
              best = { q: mid, blob: b }
              low = mid
            } else if (sizeKB < min) {
              low = mid
              best = { q: mid, blob: b }
            } else {
              high = mid
            }
          }
          finalQ = best.q
          finalBlob = best.blob
        }
      }
    } else {
      // Fallback: no constraints or unable to reach max, render with preferred quality
      finalBlob = await renderToBlob(w, h, quality)
    }

    // Convert to base64 only once at the end
    const base64Result = await blobToBase64(finalBlob)

    // Release bitmap
    if ('close' in imgBitmap) (imgBitmap as any).close?.()

    if (debug) {
      const originalSizeInKB = (base64.length * 3) / 4 / 1024
      const sizeInKB = (base64Result.length * 3) / 4 / 1024
      console.info(`Base64 image compressed from ${originalSizeInKB.toFixed(2)} KB to ${sizeInKB.toFixed(2)} KB`)
    }

    return base64Result
  } catch (error) {
    const message = (error as Error)?.message ?? String(error)
    throw new Error(`Compression failed: ${message}`)
  }
}
