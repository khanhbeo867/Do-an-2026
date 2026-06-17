import type { ICostume } from '@/apis/costume/types'
import type { IEquipmentProps } from '@/apis/equipment-props/types'
import { useMemo } from 'react'

export const useGetRentalPriceRange = (products: Array<ICostume | IEquipmentProps>) => {
  const maxPrice = useMemo(
    () =>
      Array.isArray(products) && products.length > 0
        ? Math.max(...products.map((item) => item.rental_price_per_day))
        : 0,
    [products]
  )
  const minPrice = useMemo(
    () =>
      Array.isArray(products) && products.length > 0
        ? Math.min(...products.map((item) => item.rental_price_per_day))
        : 0,
    [products]
  )

  const roundDown = (value: number, step: number) => Math.floor(value / step) * step
  const roundUp = (value: number, step: number) => Math.ceil(value / step) * step

  const STEP = 100000
  const roundedMin = roundDown(minPrice, STEP)
  const roundedMax = roundUp(maxPrice, STEP)

  return useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return []

    const ranges = []
    for (let start = roundedMin; start < roundedMax; start += STEP) {
      const end = Math.min(start + STEP, roundedMax)
      ranges.push({ min: start, max: end })
    }

    return ranges
  }, [roundedMin, roundedMax])
}
