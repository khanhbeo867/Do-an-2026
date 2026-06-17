import { coalesce } from './common'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number.parseInt(amount.toString()))
}

export default function formatIntlNumber(value: any) {
  const _value = coalesce(value, 0)
  return new Intl.NumberFormat().format(_value)
}

/**
 * Format phone number in Vietnamese style
 * Supports:
 * - Local format: 09XX-XXX-XXX (10 digits starting with 0)
 * - International format: +84 9XX XXX XXX (starting with country code +84)
 *
 * @param phoneNumber - Raw phone number string
 * @param format - 'local' or 'international' (default: 'local')
 * @returns Formatted phone number
 *
 * @example
 * formatPhoneNumber('0912345678') // '0912-345-678'
 * formatPhoneNumber('0912345678', 'international') // '+84 912 345 678'
 * formatPhoneNumber('84912345678', 'international') // '+84 912 345 678'
 * formatPhoneNumber('+84912345678', 'local') // '0912-345-678'
 */
export function formatPhoneNumber(phoneNumber: string, format: 'local' | 'international' = 'local'): string {
  if (!phoneNumber) return ''

  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '')

  // Remove leading '+' if present for processing
  const hasPlus = cleaned.startsWith('+')
  if (hasPlus) {
    cleaned = cleaned.slice(1)
  }

  // Remove country code if present (84 for Vietnam)
  if (cleaned.startsWith('84')) {
    cleaned = cleaned.slice(2)
  }

  // Ensure it starts with 0 for local format
  if (!cleaned.startsWith('0') && cleaned.length === 9) {
    cleaned = '0' + cleaned
  }

  // Validate: must be 10 digits starting with 0
  if (cleaned.length !== 10 || !cleaned.startsWith('0')) {
    return phoneNumber // Return original if invalid
  }

  if (format === 'local') {
    // Format: 09XX-XXX-XXX
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  } else {
    // Format: +84 9XX XXX XXX
    const withoutZero = cleaned.slice(1)
    return `+84 ${withoutZero.slice(0, 3)} ${withoutZero.slice(3, 6)} ${withoutZero.slice(6)}`
  }
}

/**
 * Remove all formatting from phone number
 * @param phoneNumber - Formatted phone number
 * @returns Raw phone number (digits only, starting with 0)
 *
 * @example
 * removePhoneNumberFormat('0912-345-678') // '0912345678'
 * removePhoneNumberFormat('+84 912 345 678') // '0912345678'
 */
export function removePhoneNumberFormat(phoneNumber: string): string {
  if (!phoneNumber) return ''

  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/[^\d]/g, '')

  // Convert from international format to local
  if (cleaned.startsWith('84')) {
    cleaned = '0' + cleaned.slice(2)
  }

  return cleaned
}

/**
 * Validate Vietnamese phone number
 * @param phoneNumber - Phone number to validate (formatted or raw)
 * @returns true if valid Vietnamese phone number
 *
 * @example
 * isValidPhoneNumber('0912345678') // true
 * isValidPhoneNumber('0912-345-678') // true
 * isValidPhoneNumber('+84912345678') // true
 * isValidPhoneNumber('123') // false
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber) return false

  const cleaned = removePhoneNumberFormat(phoneNumber)

  // Must be 10 digits and start with 0
  // Valid prefixes: 08, 09, 01 (for some providers), 03-07 (modern)
  const vietnamPhoneRegex = /^0[1-9]\d{8}$/

  return vietnamPhoneRegex.test(cleaned)
}
