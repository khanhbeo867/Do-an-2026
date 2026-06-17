import { ItemType } from '@/common/constants/enums'

export type TLoanItemTypeOption = {
  label: string
  value: 'COSTUME' | 'EQUIPMENT_PROPS'
}

export type TLoanItemOption = {
  sku: string
  item_id: number
  item_type: 'COSTUME' | 'EQUIPMENT_PROPS'
  name: string
  price?: number
  rental_price_per_day?: number
}

export type TLoanItemOptionGroup = {
  label: string
  items: TLoanItemOption[]
}

export type TLoanItemRow = {
  item_type: TLoanItemTypeOption
  item: TLoanItemOption
}

export const loanItemTypeOptions: TLoanItemTypeOption[] = [
  { label: 'Trang phục', value: ItemType.COSTUME },
  { label: 'Đạo cụ', value: ItemType.EQUIPMENT_PROPS },
]

export const createEmptyLoanItemOption = (
  itemType: 'COSTUME' | 'EQUIPMENT_PROPS' = ItemType.COSTUME
): TLoanItemOption => ({
  sku: '',
  item_id: 0,
  item_type: itemType,
  name: '',
  price: 0,
  rental_price_per_day: 0,
})

export const createLoanItemRow = (itemType: TLoanItemTypeOption = loanItemTypeOptions[0]): TLoanItemRow => ({
  item_type: itemType,
  item: createEmptyLoanItemOption(itemType.value),
})
