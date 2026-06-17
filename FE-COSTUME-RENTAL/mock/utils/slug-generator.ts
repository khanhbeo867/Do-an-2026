import slugify from 'slugify'

/**
 * Generate slug from name with Vietnamese locale support
 * @param name - The text to slugify
 * @returns slugified text (lowercase, trimmed)
 */
export function generateSlug(name: string): string {
  return slugify(name, {
    locale: 'vi',
    lower: true,
    trim: true,
  })
}

/**
 * Generate slug with duplicate check
 * @param name - The text to slugify
 * @param collectionName - The collection name to check for duplicates
 * @param db - The database instance (json-server router db)
 * @param excludeId - Optional ID to exclude from duplicate check (for update operations)
 * @returns unique slug with id appended if duplicate found
 */
export function generateUniqueSlug(name: string, collectionName: string, db: any, excludeId?: number): string {
  const baseSlug = generateSlug(name)

  // Check if slug already exists in the collection
  const existing = db
    .get(collectionName)
    .find((item: any) => item.slug === baseSlug && (!excludeId || item.id !== excludeId))
    .value()

  // If slug is unique, return it as is
  if (!existing) {
    return baseSlug
  }

  // If slug exists, append the current max id + 1 to make it unique
  const allItems = db.get(collectionName).value() || []
  const maxId = Math.max(...allItems.map((item: any) => item.id || 0), 0)
  const uniqueSlug = `${baseSlug}-${maxId + 1}`

  return uniqueSlug
}
