import { ItemType } from '@/common/constants/enums'
import type { IDataTableFacetedFilterProps } from '@/components/shared/data-grid/components/table-faceted-filter'

export const WAREHOUSE_TYPE_OPTIONS: IDataTableFacetedFilterProps['options'] = [
  { label: 'Kho trang phục', value: ItemType.COSTUME, icon: 'Shirt' },
  { label: 'Kho đạo cụ', value: ItemType.EQUIPMENT_PROPS, icon: 'ToolCase' },
]
