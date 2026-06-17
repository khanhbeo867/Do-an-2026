import { ItemType } from '@/common/constants/enums'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Field, FieldLabel } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useNavigate, useSearch } from '@tanstack/react-router'

const ProductTypeFilterItem: React.FC = () => {
  const itemType = useSearch({ from: '/_public-layout/products', select: (search) => search.item_type })
  const navigate = useNavigate({ from: '/products' })

  return (
    <AccordionItem value="item_type">
      <AccordionTrigger className="xl:text-base font-semibold">Loại sản phẩm</AccordionTrigger>
      <AccordionContent>
        <RadioGroup value={itemType} onValueChange={(value) => navigate({ search: () => ({ item_type: value }) })}>
          <Field orientation="horizontal">
            <RadioGroupItem value={ItemType.COSTUME} id={ItemType.COSTUME} />
            <FieldLabel htmlFor={ItemType.COSTUME} className="font-normal">
              Trang phục
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem value={ItemType.EQUIPMENT_PROPS} id={ItemType.EQUIPMENT_PROPS} />
            <FieldLabel htmlFor={ItemType.EQUIPMENT_PROPS} className="font-normal">
              Đạo cụ
            </FieldLabel>
          </Field>
        </RadioGroup>
      </AccordionContent>
    </AccordionItem>
  )
}

export default ProductTypeFilterItem
