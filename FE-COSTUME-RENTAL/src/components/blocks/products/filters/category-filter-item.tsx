import { useGetCategoriesQuery } from '@/apis/category/hooks/use-category-request'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { omit } from 'lodash-es'

const CategoryFilterItem: React.FC = () => {
  const itemType = useSearch({
    from: '/_public-layout/products',
    select: (search) => search.item_type,
    structuralSharing: false,
  })
  const categorySlug = useSearch({
    from: '/_public-layout/products',
    select: (search) => search['category_slug:eq'],
    structuralSharing: false,
  })
  const navigate = useNavigate({ from: '/products' })
  const { data: categories } = useGetCategoriesQuery({ 'type:eq': itemType })

  return (
    <AccordionItem value="category_slug" className="border-none">
      <AccordionTrigger className="xl:text-base font-semibold">Danh mục</AccordionTrigger>
      <AccordionContent>
        <FieldGroup>
          <RadioGroup
            value={categorySlug ?? ''}
            onValueChange={(value) =>
              navigate({
                search: (prev) => {
                  if (!value) return omit(prev, ['category_slug:eq'])
                  return { ...prev, 'category_slug:eq': value }
                },
              })
            }
          >
            <Field orientation="horizontal">
              <RadioGroupItem value="" id="all-categories" />
              <FieldLabel htmlFor="all-categories" className="text-sm">
                Tất cả danh mục
              </FieldLabel>
            </Field>
            {Array.isArray(categories) &&
              categories.map((category) => (
                <Field orientation="horizontal" key={category.slug}>
                  <RadioGroupItem id={category.slug} value={category.slug} />
                  <FieldLabel htmlFor={category.slug} className="text-sm">
                    {category.name}
                  </FieldLabel>
                </Field>
              ))}
          </RadioGroup>
        </FieldGroup>
      </AccordionContent>
    </AccordionItem>
  )
}

export default CategoryFilterItem
