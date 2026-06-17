import { useGetCostumesQuery } from '@/apis/costume/hooks/use-costume-request'
import { useGetPropsQuery } from '@/apis/equipment-props/hooks/use-equipment-props-request'
import { ItemType } from '@/common/constants/enums'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Field, FieldLabel } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { omit } from 'lodash-es'
import { useGetRentalPriceRange } from './use-get-rental-price-range'

const PricingFilterItem: React.FC = () => {
  const itemType = useSearch({ from: '/_public-layout/products', select: (search) => search.item_type })
  const minPrice = useSearch({
    from: '/_public-layout/products',
    select: (search) => search['rental_price_per_day:gte'],
    structuralSharing: false,
  })
  const maxPrice = useSearch({
    from: '/_public-layout/products',
    select: (search) => search['rental_price_per_day:lte'],
    structuralSharing: false,
  })
  const navigate = useNavigate({ from: '/products' })

  const { data: costumes } = useGetCostumesQuery()
  const { data: equipmentProps } = useGetPropsQuery()

  const dataSet = {
    [ItemType.COSTUME]: costumes,
    [ItemType.EQUIPMENT_PROPS]: equipmentProps,
  }

  const productRentalPriceRange = useGetRentalPriceRange(dataSet[itemType ?? ItemType.COSTUME] ?? [])

  return (
    <AccordionItem value="rental_price_per_day" className="border-none">
      <AccordionTrigger className="xl:text-base font-semibold">Giá thuê (VND/ngày)</AccordionTrigger>
      <AccordionContent>
        <RadioGroup
          value={minPrice ? JSON.stringify({ min: minPrice, max: maxPrice }) : ''}
          onValueChange={(value) =>
            navigate({
              search: (prev) => {
                const priceRange = value ? (JSON.parse(value) as { min: number; max: number }) : null
                if (!priceRange) return omit(prev, ['rental_price_per_day:lte', 'rental_price_per_day:gte'])
                return {
                  ...prev,
                  'rental_price_per_day:gte': priceRange.min,
                  'rental_price_per_day:lte': priceRange.max,
                }
              },
            })
          }
        >
          <Field orientation="horizontal">
            <RadioGroupItem value="" id="all-price" />
            <FieldLabel htmlFor="all-price" className="font-normal">
              Tất cả giá
            </FieldLabel>
          </Field>
          {Array.isArray(productRentalPriceRange) &&
            productRentalPriceRange.map((range, index) => (
              <Field orientation="horizontal" key={index}>
                <RadioGroupItem value={JSON.stringify(range)} id={`${range.min}-${range.max}`} />
                <FieldLabel htmlFor={`${range.min}-${range.max}`} className="text-sm">
                  {range.min.toLocaleString()} - {range.max.toLocaleString()}
                </FieldLabel>
              </Field>
            ))}
        </RadioGroup>
      </AccordionContent>
    </AccordionItem>
  )
}

export default PricingFilterItem
