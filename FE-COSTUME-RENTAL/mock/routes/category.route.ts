import type { Application, Request, Response } from 'express'
import path from 'node:path'
import { getDb, queryCollection, queryRecord } from '../lib'
import { jwtMiddleware } from '../middleware'
import { generateUniqueSlug } from '../utils/slug-generator'

export function registerCategoryRoutes(app: Application) {
  // * GET /categories
  app.get('/api/categories', (req: Request, res: Response) => {
    const result = queryCollection('categories', req.query, {
      transform: (record) => {
        const embedFields = (req.query._embed as string)?.split(',') || []
        if (embedFields.includes('costumes')) {
          record.costumes = queryCollection(
            'costumes',
            { 'category_id:eq': record.id },
            {
              transform: (costume) => {
                costume.images = queryCollection(
                  'images',
                  { 'id:in': costume.images.join(',') },
                  {
                    transform: (image) => ({
                      ...image,
                      url: new URL(path.join('/storage/images-gallery', image.dest), `http://localhost:8000`),
                    }),
                    pick: ['dest', 'url'],
                  }
                )
                return costume
              },
              pick: ['id', 'name', 'rental_price_per_day', 'images', 'sizes'],
            }
          )
        }

        if (embedFields.includes('equipment_props')) {
          record.equipment_props = queryCollection(
            'equipment_props',
            { 'category_id:eq': record.id },
            {
              transform: (props) => {
                props.images = queryCollection(
                  'images',
                  { 'id:in': props?.images?.join(',') },
                  {
                    transform: (image) => ({
                      url: new URL(path.join('/storage/images-gallery', image.dest), `http://localhost:8000`),
                      ...image,
                    }),
                    pick: ['dest'],
                  }
                )
                return props
              },
              pick: ['id', 'name', 'rental_price_per_day', 'images'],
            }
          )
        }

        return record
      },
    })
    return res.status(200).json(result)
  })

  // * GET /categories/:id
  app.get('/api/categories/:id', (req: Request, res: Response) => {
    const result = queryRecord('categories', Number(req.params.id), req.query)
    if (!result) return res.status(404).json({ message: 'Item category not found' })

    result.products = result.costumes ?? result.equipment_props ?? []

    if ('costumes' in result) delete result.costumes
    if ('equipment_props' in result) delete result.equipment_props

    result.products = result.products.map((product: any) => ({
      type: result.type,
      ...product,
      images: product.images.map((imageId: number) => {
        const imageDest = queryRecord('images', imageId)?.dest
        return {
          dest: imageDest,
          url: new URL(path.join('/storage/images-gallery', imageDest), `http://localhost:8000`),
        }
      }),
    }))
    return res.status(200).json(result)
  })

  // * POST /categories
  app.post('/api/categories', jwtMiddleware, (req: Request, res: Response) => {
    const { name, type } = req.body

    if (!name || !type) {
      return res.status(400).json({
        message: 'name, type are required',
      })
    }

    const db = getDb()
    const generatedSlug = generateUniqueSlug(name, 'categories', db)

    const newCategory = {
      name,
      slug: generatedSlug,
      type,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: null,
    }

    const created = db.get('categories').insert(newCategory).write()
    return res.status(201).json(created)
  })

  // * PATCH /categories/:id
  app.patch('/api/categories/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)

    const existing = db.get('categories').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Item category not found' })
    }

    const { id: _id, created_at, ...updateData } = req.body

    // Auto-generate slug if name is being updated
    if (updateData.name) {
      updateData.slug = generateUniqueSlug(updateData.name, 'categories', db, id)
    }

    const updated = db
      .get('categories')
      .find({ id })
      .assign({ ...updateData, updated_at: new Date().toISOString() })
      .write()

    return res.status(200).json(updated)
  })

  // * DELETE /categories/:id
  app.delete('/api/categories/:id', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const id = Number(req.params.id)

    const existing = db.get('categories').find({ id }).value()
    if (!existing) {
      return res.status(404).json({ message: 'Item category not found' })
    }

    if (req.query.permanantly && JSON.parse(req.query.permanantly as string)) {
      db.get('categories').remove({ id }).write()
    } else {
      db.get('categories').find({ id }).assign({ is_active: false, updated_at: new Date().toISOString() }).write()
    }

    return res.status(200).json({
      message: 'Item category deleted successfully',
    })
  })
}
