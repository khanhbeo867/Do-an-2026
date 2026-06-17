import type { ICategory } from '@/apis/category/types'
import { CommonActions, ItemType } from '@/common/constants/enums'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { usePageEventContext } from '@/contexts/event-context'
import { Shirt, ToolCase, Trash2 } from 'lucide-react'
import React from 'react'
import CategoryPopoverForm from './category-popover-form'
import { getCategoryItemCount } from './utils'

const CategoryItem: React.FC<{ data: ICategory }> = ({ data }) => {
  const { event$ } = usePageEventContext()

  return (
    <Item aria-disabled={!data.is_active} className="aria-disabled:opacity-50">
      <ItemMedia variant="image" className="bg-accent text-accent-foreground">
        {data.type === ItemType.COSTUME ? <Shirt /> : <ToolCase />}
      </ItemMedia>
      <ItemContent>
        <CategoryPopoverForm
          type={data.type}
          action={CommonActions.UPDATE}
          defaultValues={data}
          render={<ItemTitle className="hover:underline">{data.name}</ItemTitle>}
        />
        <ItemDescription>{getCategoryItemCount(data)} sản phẩm</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() =>
            event$.emit({
              action: CommonActions.DELETE,
              payload: { id: data.id, type: data.type, is_active: data.is_active },
            })
          }
        >
          <Trash2 className="group-aria-disabled/item:stroke-destructive" />
        </Button>
      </ItemActions>
    </Item>
  )
}

export default CategoryItem
