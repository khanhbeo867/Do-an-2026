export function isPrimitive(value: any) {
  return (typeof value !== 'object' && typeof value !== 'function') || value === null
}

export function coalesce<T>(value: T | null, fallbackValue: T) {
  return value === null || value === undefined ? fallbackValue : value
}
