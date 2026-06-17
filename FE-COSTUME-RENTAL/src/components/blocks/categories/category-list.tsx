import { useGetCategoriesQuery } from '@/apis/category/hooks/use-category-request'
import type { TGetCategoryQueryValue } from '@/apis/category/schemas/get-category-type.schema'
import { ItemType } from '@/common/constants/enums'
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'
import { isEmpty } from 'lodash-es'
import { NotepadText } from 'lucide-react'
import React, { memo, useMemo } from 'react'
import CategoryItem from './category-item'

type TCategoryListProps = {
  type: ItemType
  searchTerm: string
}

const CategoryList: React.FC<TCategoryListProps> = ({ type, searchTerm }) => {
  const queryParams = new Map<typeof type, TGetCategoryQueryValue>([
    [ItemType.COSTUME, { 'type:eq': ItemType.COSTUME, _embed: 'costumes' }],
    [ItemType.EQUIPMENT_PROPS, { 'type:eq': ItemType.EQUIPMENT_PROPS, _embed: 'equipment_props' }],
  ])

  const { data, isLoading } = useGetCategoriesQuery(queryParams.get(type))

  const filteredCategories = useMemo(() => {
    if (!Array.isArray(data)) return []

    return data.filter((cate) => cate.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [data, searchTerm])

  const isEmptyData = isEmpty(filteredCategories)

  return (
    <div className="space-y-1 max-h-full overflow-y-auo">
      {isLoading ? (
        Array.from({ length: 10 }, (_, index) => (
          <Item key={index}>
            <ItemMedia variant="image">
              <Skeleton className="w-full h-full aspect-square" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                <Skeleton className="h-4" />
              </ItemTitle>
              <Skeleton className="h-3" />
            </ItemContent>
          </Item>
        ))
      ) : isEmptyData ? (
        <Empty>
          <EmptyMedia variant="icon">
            <NotepadText />
          </EmptyMedia>
          <EmptyContent>
            <EmptyTitle>Không có danh mục nào</EmptyTitle>
            <EmptyDescription>Hãy thêm 1 danh mục để phân loại cho các trang phục/đạo cụ</EmptyDescription>
          </EmptyContent>
        </Empty>
      ) : (
        filteredCategories.map((category) => <CategoryItem data={category} />)
      )}
    </div>
  )
}

export default memo(CategoryList)
