import type { ICostume } from '@/apis/costume/types'
import { InventoryItemStatus } from '@/apis/inventory/constants'
import type { IWarehouse } from '@/apis/warehouse/types'
import type { Application, Request, Response } from 'express'
import path from 'node:path'
import { getDb, queryCollection, queryRecord } from '../lib'
import { jwtMiddleware } from '../middleware'

const COSTUME_SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']

type ItemType = 'COSTUME' | 'EQUIPMENT_PROPS'

function normalizeAscii(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

function getInitials(value: string): string {
  const normalized = normalizeAscii(value)
  const initials = normalized
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return initials || 'X'
}

function toItemType(value: unknown): ItemType | null {
  if (value === 'COSTUME' || value === 'EQUIPMENT_PROPS') {
    return value
  }

  return null
}

function toQuantity(value: unknown): number {
  const quantity = Number(value)
  if (!Number.isInteger(quantity) || quantity <= 0) return 0
  return quantity
}

function sizeRank(size: unknown): number {
  if (!size) return Number.MAX_SAFE_INTEGER
  const index = COSTUME_SIZE_ORDER.indexOf(String(size).toUpperCase())
  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}

function getNextSkuSeq(baseSku: string, existingSkus: string[]): number {
  const pattern = new RegExp(`^${baseSku}-(\\d+)$`)
  let maxSeq = 0

  for (const sku of existingSkus) {
    const matched = sku.match(pattern)
    if (!matched) continue
    const seqNo = Number(matched[1])
    if (Number.isFinite(seqNo) && seqNo > maxSeq) {
      maxSeq = seqNo
    }
  }

  return maxSeq + 1
}

export function registerInventoryRoutes(app: Application) {
  // * GET /inventory/costumes
  app.get('/api/inventory/costumes', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()

    const inventoryRecords = queryCollection('inventory', {
      _expand: 'inventory_condition',
      'item_type:eq': 'COSTUME',
      'is_active:eq': true,
    }) as any[]

    const costumeById = new Map<number, any>()
    const warehouseById = new Map<number, any>()

    for (const costume of queryCollection(
      'costumes',
      { _expand: 'category' },
      {
        transform: (record) => {
          const category = db.get('categories').find({ id: record.category_id }).value()
          const { category_id, ...recordWithoutCategoryId } = record
          const images = queryCollection(
            'images',
            { 'id:in': record.images },
            {
              pick: ['id', 'file_name', 'size', 'dest', 'mime_type'],
            }
          )
          return { ...recordWithoutCategoryId, images, category }
        },
      }
    ) as ICostume[]) {
      costumeById.set(costume.id, costume)
    }

    for (const warehouse of queryCollection('warehouses', {}, { pick: ['id', 'name'] }) as Pick<
      IWarehouse,
      'id' | 'name'
    >[]) {
      warehouseById.set(warehouse.id, warehouse)
    }

    const groupedMap = new Map<string, any>()

    for (const record of inventoryRecords) {
      const item = costumeById.get(record.item_id)
      if (!item) continue
      const warehouse = warehouseById.get(record.warehouse_id) ?? null
      const rentalPricePerDay = Number(item.rental_price_per_day ?? 0)
      const groupKey = `${record.item_id}-${record.item_type}`

      if (!groupedMap.has(groupKey)) {
        groupedMap.set(groupKey, {
          id: item.id,
          slug: item.slug,
          name: item.name,
          category: item.category,
          color: item.color,
          sizes: item.sizes,
          unit: item.unit,
          gender: item.gender,
          price: Number(item.price ?? 0),
          rental_price_per_day: rentalPricePerDay,
          in_stock: false,
          images: item.images,
          details: [],
        })
      }

      groupedMap.get(groupKey).details.push({
        id: record.id,
        sku: record.sku,
        size: record.size,
        status: record.status,
        warehouse,
      })
    }

    let grouped = Array.from(groupedMap.values())

    const itemId = req.query.item_id ? Number(req.query.item_id) : null
    // const conditionId = req.query.inventory_condition_id ? Number(req.query.inventory_condition_id) : null
    const warehouseId = req.query.warehouse_id ? Number(req.query.warehouse_id) : null
    const status = req.query.status ? String(req.query.status).toUpperCase() : null
    const keyword = req.query.keyword ? String(req.query.keyword).toLowerCase() : null

    grouped = grouped.filter((row) => {
      if (itemId && row.item_id !== itemId) return false
      // if (conditionId && row.inventory_condition_id !== conditionId) return false

      const matchedDetails = row.details.filter((detail: any) => {
        if (warehouseId && detail.warehouse_id !== warehouseId) return false
        if (status && String(detail.status).toUpperCase() !== status) return false
        if (
          keyword &&
          !String(detail.sku ?? '')
            .toLowerCase()
            .includes(keyword) &&
          !String(row.name ?? '')
            .toLowerCase()
            .includes(keyword)
        ) {
          return false
        }
        return true
      })

      row.details = matchedDetails
      return matchedDetails.length > 0
    })

    grouped.forEach((row) => {
      row.details.sort((a: any, b: any) => {
        const sizeDiff = sizeRank(a.size) - sizeRank(b.size)
        if (sizeDiff !== 0) return sizeDiff
        return Number(a.id) - Number(b.id)
      })
      row.in_stock = row.details.some((detail: any) => detail.status === 'AVAILABLE')
    })

    return res.status(200).json(grouped)
  })

  // * GET /inventory/props
  app.get('/api/inventory/props', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()

    const inventoryRecords = db
      .get('inventory')
      .filter((record: any) => record.item_type === 'EQUIPMENT_PROPS' && record.is_active !== false)
      .value()

    const itemById = new Map<number, any>()
    const warehouseById = new Map<number, any>()

    for (const item of db.get('equipment_props').value()) {
      itemById.set(item.id, item)
    }

    for (const warehouse of db.get('warehouses').value()) {
      warehouseById.set(warehouse.id, warehouse)
    }

    const groupedMap = new Map<string, any>()

    for (const record of inventoryRecords) {
      const item = itemById.get(record.item_id)
      if (!item) continue

      const rentalPricePerDay = Number(item.rental_price_per_day ?? 0)
      const groupKey = `${record.item_id}-${record.item_type}`

      if (!groupedMap.has(groupKey)) {
        groupedMap.set(groupKey, {
          id: item.id,
          slug: item.slug,
          name: item.name,
          price: Number(item.price ?? 0),
          in_stock: false,
          category: queryRecord('categories', item.category_id) ?? null,
          unit: item.unit,
          images: queryCollection(
            'images',
            { 'id:in': item.images },
            {
              pick: ['dest'],
              transform: (image) => ({
                ...image,
                url: new URL(path.join('/storage/images-gallery', image.dest), `http://localhost:8000`),
              }),
            }
          ),
          rental_price_per_day: rentalPricePerDay,
          details: [],
        })
      }

      const warehouse = warehouseById.get(record.warehouse_id) ?? null

      groupedMap.get(groupKey).details.push({
        id: record.id,
        sku: record.sku,
        status: record.status,
        warehouse_id: record.warehouse_id,
        warehouse,
        created_at: record.created_at,
        updated_at: record.updated_at,
      })
    }

    let grouped = Array.from(groupedMap.values())

    const itemId = req.query.item_id ? Number(req.query.item_id) : null
    const conditionId = req.query.inventory_condition_id ? Number(req.query.inventory_condition_id) : null
    const warehouseId = req.query.warehouse_id ? Number(req.query.warehouse_id) : null
    const status = req.query.status ? String(req.query.status).toUpperCase() : null
    const keyword = req.query.keyword ? String(req.query.keyword).toLowerCase() : null

    grouped = grouped.filter((row) => {
      if (itemId && row.item_id !== itemId) return false
      if (conditionId && row.inventory_condition_id !== conditionId) return false

      const matchedDetails = row.details.filter((detail: any) => {
        if (warehouseId && detail.warehouse_id !== warehouseId) return false
        if (status && String(detail.status).toUpperCase() !== status) return false
        if (
          keyword &&
          !String(detail.sku ?? '')
            .toLowerCase()
            .includes(keyword) &&
          !row.master.name.toLowerCase().includes(keyword)
        ) {
          return false
        }
        return true
      })

      row.details = matchedDetails
      return matchedDetails.length > 0
    })

    grouped.forEach((row) => {
      row.in_stock = row.details.some((detail: any) => detail.status === 'AVAILABLE')
      row.details.sort((a: any, b: any) => Number(a.id) - Number(b.id))
    })

    return res.status(200).json(grouped)
  })

  // * POST /inventory/import
  app.post('/api/inventory/import', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const { item_id, item_type, warehouse_id, size, quantity } = req.body

    const parsedItemType = toItemType(item_type)
    if (!parsedItemType) {
      return res.status(400).json({ message: 'item_type must be COSTUME or EQUIPMENT_PROPS' })
    }

    const itemId = Number(item_id)
    const warehouseId = Number(warehouse_id)
    const importQuantity = toQuantity(quantity)

    if (!itemId || !warehouseId || !importQuantity) {
      return res.status(400).json({
        message: 'item_id, warehouse_id and quantity are required',
      })
    }

    const itemCollection = parsedItemType === 'COSTUME' ? 'costumes' : 'equipment_props'
    const item = db.get(itemCollection).find({ id: itemId }).value()

    if (!item) {
      return res.status(404).json({ message: `${itemCollection} item not found` })
    }

    const warehouse = db.get('warehouses').find({ id: warehouseId }).value()
    if (!warehouse) {
      return res.status(404).json({ message: 'warehouse not found' })
    }

    if (warehouse.type !== parsedItemType) {
      return res.status(400).json({
        message: `warehouse type ${warehouse.type} does not support ${parsedItemType}`,
      })
    }

    const normalizedSize = typeof size === 'string' ? size.toUpperCase() : null

    if (parsedItemType === 'COSTUME') {
      if (!normalizedSize) {
        return res.status(400).json({ message: 'size is required when item_type is COSTUME' })
      }

      const availableSizes = Array.isArray(item.sizes) ? item.sizes.map((s: string) => s.toUpperCase()) : []
      if (!availableSizes.includes(normalizedSize)) {
        return res.status(400).json({ message: `size ${normalizedSize} is not valid for this costume` })
      }
    }

    const prefix = parsedItemType === 'COSTUME' ? 'TP' : 'DC'
    const initials = getInitials(String(item.name ?? ''))
    const colorToken =
      parsedItemType === 'COSTUME'
        ? `${String(item?.color?.code ?? '').toUpperCase()}${String(item?.color?.intensity ?? '').toUpperCase()}`
        : getInitials(String(item.name ?? ''))

    const normalizedColorToken = colorToken || 'X'
    const baseSku = [prefix, initials, normalizedColorToken]
    if (req.body.size) baseSku.push(req.body.size.toUpperCase())

    const formattedSku = baseSku.join('-').toUpperCase()
    const existingSkus = db
      .get('inventory')
      .filter((record: any) => typeof record.sku === 'string' && record.sku.startsWith(`${formattedSku}-`))
      .map((record: any) => String(record.sku))
      .value()

    const startSeq = getNextSkuSeq(formattedSku, existingSkus)
    const createdRecords: any[] = []

    console.log('baseSku', baseSku)

    for (let i = 0; i < importQuantity; i++) {
      const seqNo = startSeq + i
      const sku = `${formattedSku}-${String(seqNo).padStart(4, '0')}`

      const created = db
        .get('inventory')
        .insert({
          sku,
          item_id: itemId,
          item_type: parsedItemType,
          warehouse_id: warehouseId,
          status: 'AVAILABLE',
          ...(parsedItemType === 'COSTUME' && { size: normalizedSize }),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: null,
        })
        .write()

      createdRecords.push(created)
    }

    return res.status(201).json({
      message: `Imported ${createdRecords.length} inventory items successfully`,
      data: createdRecords,
    })
  })

  // * DELETE /inventory/delete/:sku
  app.delete('/api/inventory/delete/:sku', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const sku = String(req.params.sku)

    const existing = db.get('inventory').find({ sku }).value()
    if (!existing || existing.is_active === false) {
      return res.status(404).json({ message: 'Inventory report not found' })
    }

    if (req.query.permanantly && JSON.parse(req.query.permanantly as string)) {
      db.get('inventory').remove({ sku }).write()
    } else {
      db.get('inventory')
        .find({ sku })
        .assign({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .write()
    }

    return res.status(200).json({
      message: 'Inventory report deleted successfully',
    })
  })

  /**
   * @deprecated
   */
  app.get('/api/inventory/conditions', (_req: Request, res: Response) => {
    const conditions = queryCollection('inventory_conditions', {})
    return res.status(200).json(conditions)
  })

  // * PATCH /inventory/:sku/condition
  app.patch('/api/inventory/status/:sku', jwtMiddleware, (req: Request, res: Response) => {
    const db = getDb()
    const sku = String(req.params.sku)

    console.log('req.body', req.body)

    if (!Object.values(InventoryItemStatus).includes(req.body.status))
      return res.status(400).json({ message: `Invalid status value` })

    const updated = db
      .get('inventory')
      .find({ sku })
      .assign({
        status: req.body.status,
        updated_at: new Date().toISOString(),
      })
      .write()

    delete updated.inventory_condition_id

    return res.status(200).json({
      ...updated,
      status: req.body.status,
    })
  })
}
