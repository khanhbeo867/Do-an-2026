import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SlidersHorizontalIcon } from 'lucide-react'
import ProductFilters from './filters'
import ProductList from './product-list'

const ProductPage: React.FC = () => {
  return (
    <main className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:gap-0 lg:px-0 lg:py-0">
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" className="w-full border-dashed">
                <SlidersHorizontalIcon /> Bộ lọc sản phẩm
              </Button>
            }
          />
          <SheetContent side="left" className="w-[min(92vw,420px)] p-0">
            <SheetHeader>
              <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4">
              <ProductFilters sticky={false} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden p-6 lg:block">
        <ProductFilters />
      </aside>

      <section className="flex-1 px-0 py-0 lg:px-6 lg:py-6 lg:pl-0">
        <ProductList />
      </section>
    </main>
  )
}

export default ProductPage
