import { CommonActions, type ItemType } from '@/common/constants/enums'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { PageEventProvider } from '@/contexts/event-context'
import { CircleFadingPlusIcon, PanelRightDashed } from 'lucide-react'
import { useCallback, useState } from 'react'
import CategoryList from './category-list'
import CategoryPopoverForm from './category-popover-form'
import CategorySearchInput from './category-search-input'
import DeleteAlertDialog from './delete-alert-dialog'
import { getCategoryTypeName } from './utils'

const CategorySheet: React.FC<{ type: ItemType }> = ({ type }) => {
  const [search, setSearch] = useState('')

  const handleSearchChange = useCallback(setSearch, [])

  return (
    <PageEventProvider>
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="outline" className="border-dashed">
              <PanelRightDashed /> Quản lý danh mục
            </Button>
          }
        />
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Danh mục {getCategoryTypeName(type)}</SheetTitle>
          </SheetHeader>
          <CategorySearchInput searchTerm={search} onSearchTermChange={handleSearchChange} />
          <CategoryList type={type} searchTerm={search} />
          <SheetFooter>
            <CategoryPopoverForm
              type={type}
              action={CommonActions.CREATE}
              render={
                <Button>
                  <CircleFadingPlusIcon /> Thêm danh mục
                </Button>
              }
            />
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <DeleteAlertDialog />
    </PageEventProvider>
  )
}

export default CategorySheet
