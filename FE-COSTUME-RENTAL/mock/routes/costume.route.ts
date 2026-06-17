import type { Application, Request, Response } from 'express'
import path from 'node:path'
import { getDb, queryCollection, queryRecord } from '../lib'
import { jwtMiddleware } from '../middleware'
import { generateUniqueSlug } from '../utils/slug-generator'

export function registerCostumeRoutes(app: Application) {
  // * GET /costumes
  app.get('/api/costumes', (req: Request, res: Response) => {
    const db = getDb()
    const result = queryCollection('costumes', req.query, {
      transform: (record) => {
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

  // * GET /costumes/:id
  app.get('/api/costumes/:id', (req: Request, res: Response) => {
    const result = queryRecord('costumes', Number(req.params.id), req.query, {
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
        const inventory = queryCollection('inventory', { 'item_id:eq': record.id, _expand: 'inventory_condition' })

        const availableQty = (inventory as any[]).filter((item) => item.status === 'AVAILABLE').length
        const totalQty = (inventory as any[]).length

        const inventoryDetails = {
          total_quantity: totalQty,
          available_quantity: availableQty,
          is_available: availableQty > 0,
          by_size: Object.entries(
            Object.fromEntries(
              record.sizes?.map((size: any) => {
                const sizeInventory = (inventory as any[]).filter((item) => item.size === size)
                const sizeAvailableQty = sizeInventory.filter((item) => item.status === 'AVAILABLE').length
                const sizeTotalQty = sizeInventory.length
                return [
                  size,
                  {
                    total_quantity: sizeTotalQty ?? 0,
                    available_quantity: sizeAvailableQty ?? 0,
                    is_available: sizeAvailableQty > 0,
                  },
                ]
              }) || []
            )
          ).map(([size, data]) => ({ size, ...data })),
        }

        return { ...record, images, inventory: inventoryDetails }
      },
    })
    if (!result) return res.status(404).json({ message: 'Costume not found' })
    return res.status(200).json(result)
  })

  // * POST /costumes
  app.post('/api/costumes', jwtMiddleware, (req: Request, res: Response) => {
    const { name, category_id, sizes, gender, images, rental_price_per_day, unit, description, hashtags, color } =
      req.body

    if (!name || !category_id || !sizes || !gender || !rental_price_per_day) {
      return res.status(400).json({
        message: 'name, category_id, sizes, gender and rental_price_per_day are required',
      })
    }

    if (rental_price_per_day < 50000) {
      return res.status(400).json({
        message: 'rental_price_per_day must be at least 50000',
      })
    }

    const db = getDb()
    const generatedSlug = generateUniqueSlug(name, 'costumes', db)

    const newCostume = {
      slug: generatedSlug,
      name,
      category_id,
      color: color ?? null,
      sizes: Array.isArray(sizes) ? sizes : [sizes],
      gender,
      images,
      unit,
      rental_price_per_day,
      description: description ?? null,
      hashtags: Array.isArray(hashtags) ? hashtags : [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: null,
    }

    const created = db.get('costumes').insert(newCostume).write()
    return res.status(201).json(created)
  })

  // * PATCH /costumes/:id
  app.patch('/api/costumes/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)

    const existing = db.get('costumes').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Costume not found' })
    }

    if (req.body.rental_price_per_day && req.body.rental_price_per_day < 50000) {
      return res.status(400).json({
        message: 'rental_price_per_day must be at least 50000',
      })
    }

    const { id: _id, created_at, ...updateData } = req.body

    // Auto-generate slug if name is being updated
    if (updateData.name) {
      updateData.slug = generateUniqueSlug(updateData.name, 'costumes', db, id)
    }

    // Convert single values to arrays if needed
    if (updateData.sizes && !Array.isArray(updateData.sizes)) {
      updateData.sizes = [updateData.sizes]
    }
    if (updateData.hashtags && !Array.isArray(updateData.hashtags)) {
      updateData.hashtags = [updateData.hashtags]
    }

    const updated = db
      .get('costumes')
      .find({ id })
      .assign({ ...updateData, updated_at: new Date().toISOString() })
      .write()

    return res.status(200).json(updated)
  })

  // * DELETE /costumes/:id
  app.delete('/api/costumes/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)

    const existing = db.get('costumes').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Trang phục không tồn tại' })
    }

    if (req.query.permanantly && JSON.parse(req.query.permanantly as string)) {
      db.get('costumes').remove({ id }).write()
    } else {
      db.get('costumes').find({ id }).assign({ is_active: false, updated_at: new Date().toISOString() }).write()
    }

    return res.status(200).json({
      message: 'Costume deleted successfully',
    })
  })
}
