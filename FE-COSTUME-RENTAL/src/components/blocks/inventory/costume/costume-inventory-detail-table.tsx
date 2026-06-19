import type { CostumeSize } from '@/apis/costume/constants'
import { INVENTORY_ITEM_STATUS_LABELS, InventoryItemStatus } from '@/apis/inventory/constants'
import type { ICostumeInventory } from '@/apis/inventory/types/costume'
import { ItemType } from '@/common/constants/enums'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import InventoryItemDropdownActions from '../inventory-item-dropdown-actions'

const CostumeInventoryDetailTable: React.FC<{
  data: { items: ICostumeInventory['details']; summary: Array<{ size: CostumeSize; qty: number }> }
}> = ({ data }) => {
  return (
    <div className="relative max-h-135 max-w-fit overflow-x-scroll rounded-md pr-1 mx-auto">
      <Table className="table-auto w-auto">
        <TableHeader className="sticky left-0 top-0 z-20 [&_th]:border-l-0 w-full">
          <TableRow>
            <TableHead className="w-64">SKU</TableHead>
            <TableHead className="w-28">Size</TableHead>
            <TableHead className="w-32">Tình Trạng</TableHead>
            <TableHead className="w-44">Kho</TableHead>
            <TableHead className="w-24">Thao Tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_td]:border-l-0">
          {data.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell align="left">
                <p className="whitespace-nowrap">{item.sku}</p>
              </TableCell>
              <TableCell align="center">
                <span className='before:content-["#"] before:mr-0.5 before:text-muted-foreground'>{item.size}</span>
              </TableCell>
              <TableCell align="center">
                <Badge variant={item.status !== InventoryItemStatus.DISPOSED ? 'outline' : 'destructive'}>
                  <Icon name={INVENTORY_ITEM_STATUS_LABELS.get(item.status)?.icon!} />
                  {INVENTORY_ITEM_STATUS_LABELS.get(item.status)?.label}
                </Badge>
              </TableCell>
              <TableCell align="center">{item.warehouse?.name}</TableCell>
              <TableCell align="center" className="">
                <InventoryItemDropdownActions sku={item.sku} type={ItemType.COSTUME} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="sticky bottom-0 z-20 border-t">
          <TableRow>
            <TableCell colSpan={5} className="border-t" align="center">
              Tổng Quan
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={5} className="p-0 ">
              <div className="flex items-stretch divide-x">
                <div className="flex-1 flex-col items-center justify-stretch flex">
                  <div className="text-sm py-2">Size</div>
                  <Separator />
                  <div className="font-medium py-2">Số lượng</div>
                </div>
                {data.summary.map((item) => (
                  <div key={item.size} className="flex-1 flex-col items-center justify-stretch flex">
                    <div className="text-muted-foreground py-2 before:content-['#'] before:mr-0.5">{item.size}</div>
                    <Separator />
                    <div className="font-medium py-2">{item.qty}</div>
                  </div>
                ))}
                <div className="flex-1 flex-col items-center justify-stretch flex">
                  <div className="text-sm py-2">Tổng</div>
                  <Separator />
                  <div className="font-bold py-2">{data.summary.reduce((acc, curr) => acc + curr.qty, 0)}</div>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

export default CostumeInventoryDetailTable
