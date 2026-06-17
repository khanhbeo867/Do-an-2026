import type { Router } from 'express'
import type { JsonServerRouter } from 'json-server'
import { isNil } from 'lodash-es'

// ============================================================
// Query helpers
// ============================================================

type QueryParams = Record<string, any>

let _router: Router

/** Must be called once after creating the json-server router */
function bootstrap(r: Router) {
  _router = r
}

function getDb() {
  return (_router as any).db as JsonServerRouter<object>['db']
}

function toList(value: any): string[] {
  if (!value) return []
  const values = Array.isArray(value) ? value : [value]
  return values
    .flatMap((v) => String(v).split(','))
    .map((v) => v.trim())
    .filter(Boolean)
}

function toSingular(name: string): string {
  if (name.endsWith('ies')) return `${name.slice(0, -3)}y`
  if (name.endsWith('s')) return name.slice(0, -1)
  return name
}

function toPlural(name: string): string {
  if (name.endsWith('y')) return `${name.slice(0, -1)}ies`
  if (name.endsWith('s')) return name
  return `${name}s`
}

function resolveCollectionName(db: ReturnType<typeof getDb>, relation: string): string | null {
  const aliases: Record<string, string> = {
    cate: 'categories',
    category: 'categories',
    image: 'images',
  }

  const lowerRelation = relation.toLowerCase()
  const candidates = [
    aliases[lowerRelation],
    relation,
    lowerRelation,
    toPlural(relation),
    toPlural(lowerRelation),
  ].filter((candidate): candidate is string => Boolean(candidate))

  for (const candidate of candidates) {
    try {
      const maybeCollection = db.get(candidate).value()
      if (Array.isArray(maybeCollection)) return candidate
    } catch {
      // Continue checking next candidate
    }
  }

  return null
}

function getForeignKeyCandidates(parentCollection: string): string[] {
  const aliases: Record<string, string[]> = {
    categories: ['cate'],
  }

  const singularParent = toSingular(parentCollection)
  const baseCandidates = [parentCollection, singularParent]
  const aliasCandidates = aliases[parentCollection] ?? []

  return Array.from(new Set([...baseCandidates, ...aliasCandidates])).map((name) => `${name}_id`)
}

/** Get nested value from object by dot-path (e.g. "author.name") */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

/**
 * Evaluate a condition node against a record.
 * Supports operators: gt, gte, lt, lte, ne, eq, like, in, nin
 * and logical: and, or
 *
 * @example
 * matchCondition(record, { views: { gt: 100 } })
 * matchCondition(record, { or: [{ views: { gt: 100 } }, { title: { like: 'foo' } }] })
 */
function matchCondition(record: any, condition: Record<string, any>): boolean {
  for (const [key, value] of Object.entries(condition)) {
    // Logical operators
    if (key === 'and') {
      if (!Array.isArray(value)) return false
      if (!value.every((c) => matchCondition(record, c))) return false
      continue
    }
    if (key === 'or') {
      if (!Array.isArray(value)) return false
      if (!value.some((c) => matchCondition(record, c))) return false
      continue
    }

    const fieldValue = getNestedValue(record, key)

    // value is an operator object e.g. { gt: 100 }
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const operators = value as Record<string, any>

      // Recurse: nested field condition e.g. { author: { name: { lt: 'm' } } }
      const isOperatorKey = ['gt', 'gte', 'lt', 'lte', 'ne', 'eq', 'like', 'in', 'nin'].some((op) => op in operators)

      if (!isOperatorKey) {
        // Nested path: recurse with nested object as record
        if (!matchCondition(fieldValue ?? {}, operators)) return false
        continue
      }

      for (const [op, operand] of Object.entries(operators)) {
        switch (op) {
          case 'gt':
            if (!(fieldValue > operand)) return false
            break
          case 'gte':
            if (!(fieldValue >= operand)) return false
            break
          case 'lt':
            if (!(fieldValue < operand)) return false
            break
          case 'lte':
            if (!(fieldValue <= operand)) return false
            break
          case 'ne':
            if (fieldValue == operand) return false
            break
          case 'eq':
            if (fieldValue != operand) return false
            break
          case 'like':
            if (
              !String(fieldValue ?? '')
                .toLowerCase()
                .includes(String(operand).toLowerCase())
            )
              return false
            break
          case 'in':
            if (!Array.isArray(operand) || !operand.includes(fieldValue)) return false
            break
          case 'nin':
            if (!Array.isArray(operand) || operand.includes(fieldValue)) return false
            break
        }
      }
    } else {
      // Plain equality e.g. { role: "MANAGER" }
      if (String(fieldValue) !== String(value)) return false
    }
  }
  return true
}

/** Filter records by simple query params (ignoring _ prefixed params) */
type FieldOperator = 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'ne' | 'in' | 'contains' | 'startsWith' | 'endsWith'

const FIELD_OPERATORS = new Set<FieldOperator>([
  'lt',
  'lte',
  'gt',
  'gte',
  'eq',
  'ne',
  'in',
  'contains',
  'startsWith',
  'endsWith',
])

/**
 * Parse a "field:operator" key into { field, operator }.
 * Returns null if no valid operator suffix found.
 */
function parseFieldOperator(key: string): { field: string; operator: FieldOperator } | null {
  const colonIdx = key.lastIndexOf(':')
  if (colonIdx === -1) return null
  const op = key.slice(colonIdx + 1) as FieldOperator
  if (!FIELD_OPERATORS.has(op)) return null
  return { field: key.slice(0, colonIdx), operator: op }
}

/**
 * Evaluate a single field:operator condition against a record.
 * Supports dot-path fields (e.g. "author.name").
 */
function evalOperator(record: any, field: string, operator: FieldOperator, rawValue: string): boolean {
  const fieldValue = getNestedValue(record, field)
  const strField = String(fieldValue ?? '').toLowerCase()

  switch (operator) {
    case 'eq':
      return String(fieldValue) === rawValue
    case 'ne':
      return String(fieldValue) !== rawValue
    case 'gt':
      return Number(fieldValue) > Number(rawValue)
    case 'gte':
      return Number(fieldValue) >= Number(rawValue)
    case 'lt':
      return Number(fieldValue) < Number(rawValue)
    case 'lte':
      return Number(fieldValue) <= Number(rawValue)
    case 'in':
      return rawValue
        .split(',')
        .map((v) => v.trim())
        .includes(String(fieldValue))
    case 'contains':
      return strField.includes(rawValue.toLowerCase())
    case 'startsWith':
      return strField.startsWith(rawValue.toLowerCase())
    case 'endsWith':
      return strField.endsWith(rawValue.toLowerCase())
    default:
      return true
  }
}

function applyFilters(records: any[], filters: QueryParams): any[] {
  // _where: complex JSON filter
  if (filters._where) {
    try {
      const condition = typeof filters._where === 'string' ? JSON.parse(filters._where) : filters._where
      return records.filter((r) => matchCondition(r, condition))
    } catch {
      // invalid JSON → fall through to normal filters
    }
  }

  return Object.entries(filters).reduce((result, [key, value]) => {
    if (key.startsWith('_')) return result

    // field:operator=value syntax (e.g. views:gt=100, title:contains=hello)
    const parsed = parseFieldOperator(key)
    if (parsed) {
      return result.filter((r) => evalOperator(r, parsed.field, parsed.operator, String(value)))
    }

    // Plain equality (e.g. role=MANAGER, author.name=typicode)
    return result.filter((r) => String(getNestedValue(r, key)) === String(value))
  }, records)
}

/** Sort records by _sort and _order */
function applySort(records: any[], sort?: string, order?: string): any[] {
  if (!sort) return records
  const dir = String(order || 'asc').toLowerCase()
  return [...records].sort((a, b) => {
    if (a[sort] < b[sort]) return dir === 'asc' ? -1 : 1
    if (a[sort] > b[sort]) return dir === 'asc' ? 1 : -1
    return 0
  })
}

/** Paginate records, returns { data, total } and sets X-Total-Count header */
function applyPagination(records: any[], page?: string, perPage?: string): Pagination<any> {
  if (!page)
    return {
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: null,
      prevPage: null,
      totalPages: 1,
      totalDocs: records.length,
      limit: records.length,
      page: 1,
      data: records,
    }
  const total = records.length
  const p = Math.max(1, Number(page))
  const pp = Math.max(1, Number(perPage) || 10)
  const start = (p - 1) * pp

  return {
    hasNextPage: start + pp < total,
    hasPrevPage: start > 0,
    nextPage: start + pp < total ? p + 1 : null,
    prevPage: start > 0 ? p - 1 : null,
    totalPages: Math.ceil(total / pp),
    totalDocs: total,
    limit: pp,
    page: p,
    data: records.slice(start, start + pp),
  }
}

/** Expand parent relations (e.g. _expand=employee → employeeId → employees) */
function applyExpand(record: any, expandList: string[]): any {
  const db = getDb()
  for (const relation of expandList) {
    const singularRelation = toSingular(relation)
    const fkCandidates = [`${relation}_id`, `${singularRelation}_id`]
    const fk = fkCandidates.find((key) => record[key] != null)
    if (!fk) continue

    const collectionName = resolveCollectionName(db, relation)
    if (!collectionName) continue

    const parent = db.get(collectionName).find({ id: record[fk] }).value()
    if (parent) record[singularRelation] = parent
  }
  return record
}

/** Embed child relations (e.g. _embed=orders → orders where {collection}Id = record.id) */
function applyEmbed(record: any, embedList: string[], parentCollection: string): any {
  const db = getDb()
  const fkCandidates = getForeignKeyCandidates(parentCollection)

  for (const relation of embedList) {
    const collectionName = resolveCollectionName(db, relation)
    if (!collectionName) continue

    const children = db
      .get(collectionName)
      .filter((child: any) => fkCandidates.some((fk) => child?.[fk] === record.id))
      .value()

    record[relation] = children || []
  }

  return record
}

function pickFileds(record: any, fields: string[] = Object.keys(record)): any {
  const copy: any = {}
  for (const f of fields) copy[f] = record[f]
  return copy
}

/** Full query pipeline for a collection list route */
function queryCollection(
  collection: string,
  query: QueryParams,
  // res: Response,
  opts?: { pick?: string[]; transform?: (record: any) => any }
) {
  const { _expand, _embed, _page, _per_page, _sort, _order, ...filters } = query
  const db = getDb()

  let records = db.get(collection).value() as any[]
  records = applyFilters(records, filters)
  records = applySort(records, _sort, _order)
  // records = applyPagination(records, _page, _per_page)

  const expandList = toList(_expand)
  const embedList = toList(_embed)

  const data = records.map((record: any) => {
    let r = record
    r = pickFileds(r, opts?.pick)
    r = applyExpand(r, expandList)
    r = applyEmbed(r, embedList, collection)
    if (opts?.transform) r = opts.transform(r)
    return r
  })

  if (isNil(_page) && isNil(_per_page)) return data

  return applyPagination(data, _page, _per_page)
}

/** Full query pipeline for a single record route */
function queryRecord(
  collection: string,
  id: number,
  query: QueryParams = {},
  opts?: { pick?: string[]; transform?: (record: any) => any }
): any | null {
  const db = getDb()
  const record = db.get(collection).find({ id }).value()
  if (!record) return null

  let r = pickFileds(record, opts?.pick)
  r = applyExpand(r, toList(query._expand))
  r = applyEmbed(r, toList(query._embed), collection)
  if (opts?.transform) r = opts.transform(r)
  return r
}

export {
  applyEmbed,
  applyExpand,
  applyFilters,
  applyPagination,
  applySort,
  bootstrap,
  evalOperator,
  getDb,
  parseFieldOperator,
  pickFileds,
  queryCollection,
  queryRecord,
}
