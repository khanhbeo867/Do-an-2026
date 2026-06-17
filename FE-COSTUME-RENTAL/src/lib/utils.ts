import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { isNil } from 'lodash-es'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export default function env<T = string>(key: keyof InternalImportMetaEnv, defaultValue?: T) {
  const value = import.meta.env[key]
  if (!isNil(value)) return value as T
  return defaultValue
}

export const isServer = typeof window === 'undefined'
