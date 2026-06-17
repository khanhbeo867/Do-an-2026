import { COSTUME_GENDER_OPTIONS } from '@/apis/costume/constants'
import { ItemType } from '@/common/constants/enums'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Field, FieldLabel } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { omit } from 'lodash-es'
import { Activity } from 'react'

const GenderFilterItem: React.FC = () => {
  const itemType = useSearch({
    from: '/_public-layout/products',
    select: (search) => search.item_type,
    structuralSharing: false,
  })
  const gender = useSearch({
    from: '/_public-layout/products',
    select: (search) => search['gender:eq'],
    structuralSharing: false,
  })
  const navigate = useNavigate({ from: '/products' })

  return (
    <Activity mode={itemType === ItemType.COSTUME ? 'visible' : 'hidden'}>
      <AccordionItem value="gender" className="border-none">
        <AccordionTrigger className="xl:text-base font-semibold">Giới tính</AccordionTrigger>
        <AccordionContent>
          <RadioGroup
            value={gender ?? ''}
            onValueChange={(value) =>
              navigate({
                search: (prev) => {
                  if (!value) return omit(prev, ['gender:eq'])
                  return {
                    ...prev,
                    'gender:eq': value,
                  }
                },
              })
            }
          >
            <Field orientation="horizontal">
              <RadioGroupItem value="" id="all-genders" />
              <FieldLabel htmlFor="all-genders" className="text-sm">
                Tất cả
              </FieldLabel>
            </Field>
            {COSTUME_GENDER_OPTIONS.map((option) => (
              <Field orientation="horizontal" key={option.value}>
                <RadioGroupItem value={option.value} id={option.value} />
                <FieldLabel htmlFor={option.value} className="text-sm">
                  {option.label}
                </FieldLabel>
              </Field>
            ))}
          </RadioGroup>
        </AccordionContent>
      </AccordionItem>
    </Activity>
  )
}

export default GenderFilterItem
