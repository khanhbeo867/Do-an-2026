import { useGetCostumeDetailQuery } from '@/apis/costume/hooks/use-costume-request'
import type { ICostume } from '@/apis/costume/types'
import { useGetPropsDetailQuery } from '@/apis/equipment-props/hooks/use-equipment-props-request'
import type { IEquipmentProps } from '@/apis/equipment-props/types'
import type { UseSuspenseQueryResult } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'

export const useGetProductDetailQuery = (): UseSuspenseQueryResult<ICostume | IEquipmentProps, Error> | undefined => {
  const { type, productId } = useParams({ from: '/_public-layout/products/$type/$productId', strict: true })

  if (!type || !productId) return

  if (type === 'costume') return useGetCostumeDetailQuery(productId)

  if (type === 'equipment-props') return useGetPropsDetailQuery(productId)
}
