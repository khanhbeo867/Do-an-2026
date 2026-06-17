export function standardizeName(name: string): string {
  const words = name.split(/\s+/)
  const standardizedWords = words.map((word) => {
    if (word.length === 0) return ''
    const firstChar = word.charAt(0).toUpperCase()
    const restChars = word.slice(1).toLowerCase()
    return firstChar + restChars
  })
  return standardizedWords.join(' ')
}
