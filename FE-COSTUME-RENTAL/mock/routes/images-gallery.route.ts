import type { Application, Request, Response } from 'express'
import type { UploadedFile } from 'express-fileupload'
import { renameSync } from 'fs'
import path, { join, resolve } from 'path'
import { getDb, queryCollection, queryRecord } from '../lib'
import { jwtMiddleware } from '../middleware'
import { deleteUploadedFile, saveUploadedFile } from '../utils/file-upload'

export function registerImageGalleryRoutes(app: Application) {
  // * GET /images-gallery/file/:fileName
  app.get('/storage/images-gallery/:folder/:fileName', (req: Request, res: Response) => {
    const rawImageFolder = req.params.folder
    const rawFileName = req.params.fileName
    const fileName = Array.isArray(rawFileName) ? rawFileName[0] : rawFileName
    const imageFolderName = Array.isArray(rawImageFolder) ? rawImageFolder[0] : rawImageFolder

    if (!fileName || fileName.includes('..') || path.basename(fileName) !== fileName) {
      return res.status(400).json({ message: 'Invalid file name' })
    }

    const imagePath = path.resolve(process.cwd(), 'mock', imageFolderName, fileName)

    return res.sendFile(imagePath, (err) => {
      if (!err) return

      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return res.status(404).json({ message: 'Image file not found' })
      }

      return res.status(500).json({ message: 'Failed to read image file' })
    })
  })

  // * GET /images-gallery
  app.get('/api/images-gallery', (req: Request, res: Response) => {
    const result = queryCollection('images', req.query, {
      transform: (record) => {
        const user = queryRecord('users', record.created_by, { _expand: 'employee' })
        return {
          ...record,
          created_by: user,
          url: new URL(path.join('/storage/images-gallery', record.dest), `http://localhost:8000`),
        }
      },
    })
    return res.status(200).json(result)
  })

  // * GET /images-gallery/:id
  app.get('/api/images-gallery/:id', (req: Request, res: Response) => {
    const result = queryRecord('images', Number(req.params.id), req.query)
    if (!result) return res.status(404).json({ message: 'Image not found' })
    return res.status(200).json(result)
  })

  // * POST /images-gallery/upload
  app.post('/api/images-gallery/upload', jwtMiddleware, (req: Request, res: Response) => {
    // createFormData() ở frontend wrap text fields vào req.body.data (JSON string)

    const parsedData = req.body?.data ? (JSON.parse(req.body.data) as Record<string, string>) : req.body
    const { category_id } = parsedData as { category_id?: string }

    if (!category_id) {
      return res.status(400).json({
        message: 'category_id is required',
      })
    }

    const uploadedFiles = Object.values(req.files ?? {}).flatMap((entry) =>
      Array.isArray(entry) ? entry : [entry]
    ) as UploadedFile[]

    // Check if file is uploaded
    if (uploadedFiles.length === 0) {
      return res.status(400).json({
        message: 'No file uploaded',
      })
    }

    const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

    // Validate all files first
    for (const uploadedFile of uploadedFiles) {
      if (!validMimeTypes.includes(uploadedFile.mimetype)) {
        return res.status(400).json({
          message: `mime_type must be one of: image/png, image/jpg, image/jpeg, image/webp. Got: ${uploadedFile.mimetype}`,
        })
      }

      if (uploadedFile.size > MAX_FILE_SIZE) {
        return res.status(400).json({
          message: `File size must not exceed 5MB. Got: ${uploadedFile.name} (${(uploadedFile.size / 1024 / 1024).toFixed(2)}MB)`,
        })
      }
    }

    try {
      const db = getDb()
      const createdImages = []

      // Process each file
      for (const uploadedFile of uploadedFiles) {
        const { fileName, path } = saveUploadedFile(uploadedFile.data, uploadedFile.name)

        const newImage = {
          file_name: fileName,
          size: uploadedFile.size,
          dest: path,
          mime_type: uploadedFile.mimetype,
          category_id,
          created_by: req?.user?.id,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: null,
        }

        const created = db.get('images').insert(newImage).write()
        createdImages.push(created)
      }

      // Return single object if 1 file, array if multiple
      return res.status(201).json(uploadedFiles.length === 1 ? createdImages[0] : createdImages)
    } catch (error) {
      console.error('File upload error:', error)
      return res.status(500).json({
        message: 'Failed to upload file(s)',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })

  // * PATCH /images-gallery/:id
  app.patch('/api/images-gallery/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)

    const existing = db.get('images').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Image not found' })
    }

    if (req.body.mime_type) {
      const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
      if (!validMimeTypes.includes(req.body.mime_type)) {
        return res.status(400).json({
          message: 'mime_type must be one of: image/png, image/jpg, image/jpeg, image/webp',
        })
      }
    }

    if (req.body.category_id) {
      const validItemTypes = ['COSTUME', 'EQUIPMENT_PROPS']
      if (!validItemTypes.includes(req.body.category_id)) {
        return res.status(400).json({
          message: 'category_id must be one of: COSTUME, EQUIPMENT_PROPS',
        })
      }
    }

    const { id: _id, created_at, ...updateData } = req.body

    if (updateData.file_name)
      renameSync(
        resolve(join(__dirname, `../images/${existing.file_name}`)),
        resolve(join(__dirname, `../images/${updateData.file_name}`))
      )

    const updated = db
      .get('images')
      .find({ id })
      .assign({ ...updateData, dest: `/images/${updateData.file_name}`, updated_at: new Date().toISOString() })
      .write()

    return res.status(200).json(updated)
  })

  // * DELETE /images-gallery/:id
  app.delete('/api/images-gallery/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)

    const existing = db.get('images').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Image not found' })
    }

    if (req.query.permanantly && JSON.parse(req.query.permanantly as string)) {
      // Delete file from disk
      try {
        const fileName = existing.file_name
        deleteUploadedFile(fileName)
      } catch (error) {
        console.error('Error deleting file:', error)
      }

      db.get('images').remove({ id }).write()
    } else {
      db.get('images').find({ id }).assign({ is_active: false, updated_at: new Date().toISOString() }).write()
    }

    return res.status(200).json({
      message: 'Image deleted successfully',
    })
  })
}
