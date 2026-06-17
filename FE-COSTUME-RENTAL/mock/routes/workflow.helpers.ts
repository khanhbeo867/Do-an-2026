import type { Request } from 'express'
import { queryCollection, queryRecord } from '../lib'

export function nowISO() {
  return new Date().toISOString()
}

export function nextCode(collection: string, field: string, prefix: string) {
  const records = queryCollection(collection, {}) as Record<string, unknown>[]
  const pattern = new RegExp(`^${prefix}(\\d+)$`)
  const maxSeq = records.reduce((acc, record) => {
    const raw = String(record[field] ?? '')
    const matched = raw.match(pattern)
    if (!matched) return acc
    const seq = Number(matched[1])
    return Number.isFinite(seq) ? Math.max(acc, seq) : acc
  }, 0)

  return `${prefix}${String(maxSeq + 1).padStart(5, '0')}`
}

export function getRequesterEmployeeId(req: Request) {
  const userId = Number(req.user?.id ?? 0)
  if (!userId) return null
  const employee = (queryCollection('employees', { 'user_id:eq': userId }) as any[])[0]
  return employee?.id ?? null
}

export function getInventoryBySku(sku: string) {
  return (queryCollection('inventory', { 'sku:eq': sku }) as any[])[0] ?? null
}

export function getItemDetail(itemType: string, itemId: number) {
  if (itemType === 'COSTUME') {
    return queryRecord('costumes', itemId, {})
  }

  return queryRecord('equipment_props', itemId, {})
}

export function toConditionId(value: unknown) {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase()

  if (normalized === 'A' || normalized === 'GOOD' || normalized === 'TOT') return 1
  return 2
}
