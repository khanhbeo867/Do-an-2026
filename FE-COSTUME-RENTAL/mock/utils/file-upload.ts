import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = path.resolve(path.join(__dirname, '../images'))

/**
 * Ensure upload directory exists
 */
export function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

/**
 * Save uploaded file to disk
 * @param fileBuffer - The file buffer from multipart
 * @param originalFileName - Original filename
 * @returns saved filename and relative path
 */
export function saveUploadedFile(fileBuffer: Buffer, originalFileName: string): { fileName: string; path: string } {
  ensureUploadDir()

  // Generate unique filename with timestamp
  const timestamp = Date.now()
  const ext = path.extname(originalFileName)
  const fileName = `${timestamp}-${originalFileName.replace(/[^a-z0-9.-]/gi, '_').split('.')[0]}${ext}`
  const filePath = path.join(UPLOAD_DIR, fileName)

  // Write file to disk
  fs.writeFileSync(filePath, fileBuffer)

  return {
    fileName,
    path: `/images/${fileName}`,
  }
}

/**
 * Delete uploaded file from disk
 * @param fileName - Filename to delete
 */
export function deleteUploadedFile(fileName: string): boolean {
  const filePath = path.join(UPLOAD_DIR, fileName)

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    return true
  }

  return false
}

/**
 * Get file info
 * @param filePath - File path relative to public/images
 * @returns file stats
 */
export function getFileInfo(filePath: string): fs.Stats | null {
  const fullPath = path.join(UPLOAD_DIR, filePath)

  if (fs.existsSync(fullPath)) {
    return fs.statSync(fullPath)
  }

  return null
}
