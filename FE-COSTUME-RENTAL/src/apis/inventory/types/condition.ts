export interface IInventoryCondition extends IBaseEntity {
  label: string
  code: 'A' | 'B' | 'C' | 'D' | 'E'
  badge_color: string
  discount_rate: number
  rentable: boolean
  disposable: boolean
}
