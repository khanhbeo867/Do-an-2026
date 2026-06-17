import { INVENTORY_ITEM_STATUS_LABELS, InventoryItemStatus } from '@/apis/inventory/constants'
import type { IEquipmentPropsInventory } from '@/apis/inventory/types/equipment-props'
import { ItemType } from '@/common/constants/enums'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import InventoryItemDropdownActions from '../inventory-item-dropdown-actions'

const PropsInventoryDetailTable: React.FC<{
  data: IEquipmentPropsInventory['details']
}> = ({ data }) => {
  return (
    <div className="relative max-h-135 max-w-fit overflow-x-scroll rounded-md pr-1 mx-auto">
      <Table className="table-auto w-auto">
        <TableHeader className="sticky left-0 top-0 z-20 [&_th]:border-l-0 w-full">
          <TableRow>
            <TableHead className="w-56">SKU</TableHead>
            <TableHead className="w-32">Tình Trạng</TableHead>
            <TableHead className="w-44">Kho</TableHead>
            <TableHead className="w-24">Thao Tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_td]:border-l-0">
          {data.map((item) => (
            <TableRow
              key={item.id}
              className="[&:has(button[data-slot=dropdown-menu-trigger][aria-busy=true])_td]:opacity-50"
            >
              <TableCell align="left">
                <p className="line-clamp-1">{item.sku}</p>
              </TableCell>
              <TableCell align="center">
                <Badge variant={item.status !== InventoryItemStatus.DISPOSED ? 'outline' : 'destructive'}>
                  <Icon name={INVENTORY_ITEM_STATUS_LABELS.get(item.status)?.icon!} />
                  {INVENTORY_ITEM_STATUS_LABELS.get(item.status)?.label}
                </Badge>
              </TableCell>
              <TableCell align="center">{item.warehouse?.name}</TableCell>
              <TableCell align="center" className="">
                <InventoryItemDropdownActions sku={item.sku} type={ItemType.EQUIPMENT_PROPS} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default PropsInventoryDetailTable
