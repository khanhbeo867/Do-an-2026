import { COLOR_PALETTE } from '@/common/constants/const'
import { ItemType } from '@/common/constants/enums'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { omit } from 'lodash-es'
import { Activity } from 'react'

const ColorFilterItem: React.FC = () => {
  const itemType = useSearch({ from: '/_public-layout/products', select: (search) => search.item_type })
  const selectedColor = useSearch({ from: '/_public-layout/products', select: (search) => search['color:eq'] })
  const navigate = useNavigate({ from: '/products' })

  return (
    <Activity mode={itemType === ItemType.COSTUME ? 'visible' : 'hidden'}>
      <AccordionItem value="color:eq" className="border-none">
        <AccordionTrigger className="text-lg">Màu sắc</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-10 gap-2! max-w-fit">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color.hex}
                style={{
                  border: 'none',
                  backgroundColor: color.hex,
                  width: 20,
                  height: 20,
                  aspectRatio: '1 / 1',
                  borderRadius: 2,
                  ...(selectedColor === color.hex && {
                    outlineColor: color.hex,
                    outlineOffset: 2,
                    outlineWidth: 1,
                    outlineStyle: 'solid',
                  }),
                }}
                onClick={() =>
                  navigate({
                    search: (prev) => {
                      if (selectedColor === color.hex) return omit(prev, ['color:eq'])
                      return { ...prev, 'color:eq': color.hex }
                    },
                  })
                }
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Activity>
  )
}

export default ColorFilterItem
