import { SIZE_RUN } from '@/apis/costume/constants'
import { ItemType } from '@/common/constants/enums'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { omit } from 'lodash-es'
import { Activity, useMemo } from 'react'

const SizeFilterItem: React.FC = () => {
  const itemType = useSearch({ from: '/_public-layout/products', select: (search) => search.item_type })
  const selectedSizes = useSearch({ from: '/_public-layout/products', select: (search) => search['size:in'] })
  const navigate = useNavigate({ from: '/products' })

  const activeSizeValues = useMemo(
    () => (typeof selectedSizes === 'string' ? selectedSizes.split(',').filter(Boolean) : []),
    [selectedSizes]
  )

  return (
    <Activity mode={itemType === ItemType.COSTUME ? 'visible' : 'hidden'}>
      <AccordionItem value="size:eq">
        <AccordionTrigger className="text-lg">Size</AccordionTrigger>
        <AccordionContent>
          <div className="flex gap-2 flex-wrap">
            {SIZE_RUN.map((size) => {
              const isActive = activeSizeValues.includes(size.value)

              return (
                <Button
                  key={size.value}
                  size="sm"
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => {
                    navigate({
                      search: (prev) => {
                        const nextSizes = isActive
                          ? activeSizeValues.filter((s) => s !== size.value)
                          : [...activeSizeValues, size.value]

                        if (nextSizes.length === 0) {
                          return omit(prev, ['size:in'])
                        }

                        return {
                          ...prev,
                          'size:in': nextSizes.join(','),
                        }
                      },
                    })
                  }}
                >
                  {size.label}
                </Button>
              )
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Activity>
  )
}

export default SizeFilterItem
