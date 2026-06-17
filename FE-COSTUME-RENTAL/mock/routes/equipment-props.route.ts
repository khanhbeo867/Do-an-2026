import type { Application, Request, Response } from 'express'
import path from 'node:path'
import { getDb, queryCollection, queryRecord } from '../lib'
import { jwtMiddleware } from '../middleware'
import { generateUniqueSlug } from '../utils/slug-generator'

export function registerEquipmentPropsRoutes(app: Application) {
  // * GET /equipment-props
  app.get('/api/equipment-props', (req: Request, res: Response) => {
    const result = queryCollection('equipment_props', req.query, {
      transform: (record) => {
        const db = getDb()
        const category = db.get('categories').find({ id: record.category_id }).value()

        const { category_id, ...recordWithoutCategoryId } = record

        const images = queryCollection(
          'images',
          { 'id:in': record.images },
          {
            pick: ['id', 'file_name', 'size', 'dest', 'mime_type'],
            transform: (image) => ({
              ...image,
              url: new URL(path.join('/storage/images-gallery', image.dest), `http://localhost:8000`),
            }),
          }
        )

        return { ...recordWithoutCategoryId, images, category }
      },
    })
    return res.status(200).json(result)
  })

  // * GET /equipment-props/:id
  app.get('/api/equipment-props/:id', (req: Request, res: Response) => {
    const result = queryRecord('equipment_props', Number(req.params.id), req.query, {
      transform: (record) => {
        const images = queryCollection(
          'images',
          { 'id:in': record.images },
          {
            pick: ['id', 'file_name', 'size', 'dest', 'mime_type'],
            transform: (image) => ({
              ...image,
              url: new URL(path.join('/storage/images-gallery', image.dest), `http://localhost:8000`),
            }),
          }
        )
        return { ...record, images }
      },
    })
    if (!result) return res.status(404).json({ message: 'Equipment props not found' })
    return res.status(200).json(result)
  })

  // * POST /equipment-props
  app.post('/api/equipment-props', jwtMiddleware, (req: Request, res: Response) => {
    const { name, category_id, rental_price_per_day, description, images, unit, hashtags } = req.body

    if (!name || !category_id || !rental_price_per_day) {
      return res.status(400).json({
        message: 'name, category_id and rental_price_per_day are required',
      })
    }

    const db = getDb()
    const generatedSlug = generateUniqueSlug(name, 'equipment_props', db)

    const newEquipment = {
      name,
      slug: generatedSlug,
      category_id,
      rental_price_per_day,
      description: description ?? null,
      images,
      unit,
      hashtags: Array.isArray(hashtags) ? hashtags : [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: null,
    }

    const created = db.get('equipment_props').insert(newEquipment).write()
    return res.status(201).json(created)
  })

  // * PATCH /equipment-props/:id
  app.patch('/api/equipment-props/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)

    const existing = db.get('equipment_props').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Equipment props not found' })
    }

    const { id: _id, created_at, ...updateData } = req.body

    // Auto-generate slug if name is being updated
    if (updateData.name) {
      updateData.slug = generateUniqueSlug(updateData.name, 'equipment_props', db, id)
    }

    if (updateData.hashtags && !Array.isArray(updateData.hashtags)) {
      updateData.hashtags = [updateData.hashtags]
    }

    const updated = db
      .get('equipment_props')
      .find({ id })
      .assign({ ...updateData, updated_at: new Date().toISOString() })
      .write()

    return res.status(200).json(updated)
  })

  // * DELETE /equipment-props/:id
  app.delete('/api/equipment-props/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)

    const existing = db.get('equipment_props').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Equipment props not found' })
    }

    if (req.query.permanantly && JSON.parse(req.query.permanantly as string)) {
      db.get('equipment_props').remove({ id }).write()
    } else {
      db.get('equipment_props').find({ id }).assign({ is_active: false, updated_at: new Date().toISOString() }).write()
    }

    return res.status(200).json({
      message: 'Equipment props deleted successfully',
    })
  })
}
