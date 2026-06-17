import {
  GET_CATEGORIES_QUERY_KEY,
  GET_COSTUME_CATEGORY_QUERY_KEY,
  GET_PROPS_CATEGORY_QUERY_KEY,
} from '@/apis/category/hooks/use-category-request'
import type { ICategory } from '@/apis/category/types'
import { ItemType } from '@/common/constants/enums'
import formatIntlNumber from '@/common/helpers/format-intl'
import type { QueryKey } from '@tanstack/react-query'

export const getCategoryItemCount = (item: ICategory) => {
  switch (item.type) {
    case ItemType.COSTUME:
      return formatIntlNumber((item as Required<Omit<ICategory, 'equipment_props'>>).costumes?.length ?? 0)
    case ItemType.EQUIPMENT_PROPS:
      return formatIntlNumber((item as Required<Omit<ICategory, 'costumes'>>).equipment_props?.length ?? 0)
    default:
      return formatIntlNumber(0)
  }
}

export const getCategoryTypeName = (type: ItemType): string | undefined => {
  switch (type) {
    case ItemType.COSTUME:
      return 'Trang phục'
    case ItemType.EQUIPMENT_PROPS:
      return 'Đạo cụ'
    default:
      return
  }
}

export const getMutationKeys = (type: ItemType): Array<QueryKey> => {
  switch (type) {
    case ItemType.COSTUME:
      return [[GET_CATEGORIES_QUERY_KEY, GET_COSTUME_CATEGORY_QUERY_KEY]]

    case ItemType.EQUIPMENT_PROPS:
      return [[GET_CATEGORIES_QUERY_KEY, GET_PROPS_CATEGORY_QUERY_KEY]]

    default:
      return [[GET_CATEGORIES_QUERY_KEY]]
  }
}
