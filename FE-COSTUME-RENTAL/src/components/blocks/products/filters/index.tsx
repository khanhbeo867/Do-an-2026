import { Accordion } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { omit, pick } from 'lodash-es'
import { XIcon } from 'lucide-react'
import CategoryFilterItem from './category-filter-item'
import ColorFilterItem from './color-filter-item'
import DebouncedSearchInput from './debounced-search-input'
import GenderFilterItem from './gender-filter-item'
import PricingFilterItem from './pricing-filter-item'
import ProductTypeFilterItem from './product-type-filter-item'
import SizeFilterItem from './size-filter-item'

const ProductFilters: React.FC<{ sticky?: boolean; className?: string }> = ({ sticky = true, className }) => {
  const filteredPropertysCount = useSearch({
    from: '/_public-layout/products',
    select: (search) => Object.keys(omit(search, ['item_type'])).length,
    structuralSharing: false,
  })
  const navigate = useNavigate({ from: '/products' })

  return (
    <div
      className={cn(
        'space-y-6 overflow-y-auto',
        sticky
          ? 'sticky top-[calc(var(--header-top-height)+var(--header-bottom-height))] w-96 pr-2 xl:h-[calc(100vh-var(--header-top-height)-var(--header-bottom-height)-48px)]'
          : 'h-full w-full pr-0',
        className
      )}
    >
      <div className="flex justify-between items-center">
        <Typography variant="h3">Bộ lọc ({filteredPropertysCount})</Typography>
        <Button size="sm" variant="outline" onClick={() => navigate({ search: (prev) => pick(prev, ['item_type']) })}>
          <XIcon />
          Xóa lọc
        </Button>
      </div>

      <DebouncedSearchInput />

      <Accordion multiple className="w-full" defaultValue={['item_type', 'category_slug', 'rental_price_per_day']}>
        <ProductTypeFilterItem />
        <CategoryFilterItem />
        <GenderFilterItem />
        <PricingFilterItem />
        <ColorFilterItem />
        <SizeFilterItem />
      </Accordion>
    </div>
  )
}

export default ProductFilters
