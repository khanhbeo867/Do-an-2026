export const path = {
  join: (...parts: string[]) => '/' + parts.map((part) => part?.replace(/^\/|\/$/g, ''))?.join('/'),
}
